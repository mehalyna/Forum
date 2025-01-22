from django.db import transaction
from django.http import Http404
from django.utils.functional import cached_property
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
import django_filters
from djoser import utils as djoser_utils
from rest_framework.generics import (
    CreateAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    IsAdminUser,
)
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, PolymorphicProxySerializer
from utils.completeness_counter import completeness_count
from utils.moderation.send_email import send_moderation_email
from utils.moderation.encode_decode_id import decode_id
from utils.moderation.image_moderation import ModerationManager
from utils.moderation.handle_approved_images import ApprovedImagesDeleter

from forum.pagination import ForumPagination
from images.models import ProfileImage
from .models import SavedCompany, Profile, Category, Activity, Region
from .permissions import (
    UserIsProfileOwnerOrReadOnly,
    IsOwnCompany,
    IsOwner,
    RequestIsReadOnly,
    RequestIsCreate,
)
from .serializers import (
    SavedCompanySerializer,
    ViewedCompanySerializer,
    ProfileListSerializer,
    ProfileSensitiveDataROSerializer,
    ProfileDetailSerializer,
    ProfileOwnerDetailViewSerializer,
    ProfileOwnerDetailEditSerializer,
    ProfileDeleteSerializer,
    CategorySerializer,
    ActivitySerializer,
    RegionSerializer,
    ProfileCreateSerializer,
    ProfileModerationSerializer,
    SavedCompanyUpdateSerializer,
)
from .filters import ProfileFilter


class SavedCompaniesCreate(CreateAPIView):
    """
    List of saved companies.
    Add a company to the saved list.
    """

    permission_classes = [IsAuthenticated, IsOwnCompany]
    serializer_class = SavedCompanySerializer
    pagination_class = ForumPagination


@extend_schema(responses={200: {}, 204: {}})
class SavedCompaniesUpdateDestroy(RetrieveUpdateDestroyAPIView):
    """
    Update status or Remove the company from the saved list.
    """

    permission_classes = [IsAuthenticated]
    lookup_field = "company_id"
    lookup_url_kwarg = "company_pk"

    def get_queryset(self):
        return SavedCompany.objects.filter(user_id=self.request.user.id)

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return SavedCompanyUpdateSerializer
        else:
            return SavedCompanySerializer


class ProfileList(ListCreateAPIView):
    """
    List all profiles depending on query parameters:
     include_deleted: bool
     include_all: bool.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ForumPagination
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
    ]
    filterset_class = ProfileFilter

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProfileListSerializer
        else:
            return ProfileCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated:
            saved_companies_pk = frozenset(
                SavedCompany.objects.filter(
                    user=self.request.user
                ).values_list("company_id", flat=True)
            )
            context.update({"saved_companies_pk": saved_companies_pk})
        return context

    def get_queryset(self):
        user_id = self.request.query_params.get("userid")
        queryset = (
            Profile.objects.visible_only()
            .prefetch_related(
                "regions",
                "categories",
                "activities",
                "banner_approved",
                "logo_approved",
            )
            .order_by("id")
        )
        if user_id:
            try:
                return queryset.filter(person_id=user_id)
            except ValueError:
                pass
        return queryset

    def create(self, request):
        profile = Profile.objects.filter(person_id=self.request.user)
        if profile.exists():
            return Response(status=409)
        return super().create(request)


@extend_schema(
    responses={
        200: PolymorphicProxySerializer(
            component_name="profile_detail",
            serializers=[
                ProfileOwnerDetailViewSerializer,
                ProfileSensitiveDataROSerializer,
                ProfileDetailSerializer,
                ProfileOwnerDetailEditSerializer,
            ],
            resource_type_field_name=None,
        ),
        204: {},
    }
)
class ProfileDetail(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a profile instance.
    Retrieve:
        If user is a person in the profile, full info returned.
        Else profile info without sensitive data returned.
        If user is authenticated, he can get sensitive data via query param 'with_contacts'.
    """

    queryset = (
        Profile.objects.active_only()
        .select_related("person")
        .prefetch_related("regions", "categories", "activities")
    )
    permission_classes = [UserIsProfileOwnerOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated:
            saved_companies_pk = frozenset(
                SavedCompany.objects.filter(
                    user=self.request.user
                ).values_list("company_id", flat=True)
            )
            context.update({"saved_companies_pk": saved_companies_pk})
        return context

    def get_serializer_class(self):
        get_contacts = self.request.query_params.get("with_contacts")

        profile_pk = self.kwargs.get("pk")
        profile_instance = (
            Profile.objects.select_related("person")
            .filter(id=profile_pk)
            .first()
        )
        user_pk = self.request.user.id

        if self.request.method == "GET":
            if profile_instance.person.id == user_pk:
                return ProfileOwnerDetailViewSerializer
            return (
                ProfileSensitiveDataROSerializer
                if get_contacts
                else ProfileDetailSerializer
            )
        elif self.request.method == "DELETE":
            return ProfileDeleteSerializer
        else:
            return ProfileOwnerDetailEditSerializer

    def perform_destroy(self, instance):
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        user = self.request.user
        with transaction.atomic():
            instance.is_deleted = True
            instance.save()
            user.is_active = False
            user.email = (
                f"is_deleted_{now().strftime('%Y%m%d%H%M%S')}_{user.email}"
            )
            user.save()
            djoser_utils.logout_user(self.request)

    def perform_update(self, serializer):
        profile = serializer.save()
        SavedCompany.objects.filter(company=profile).update(is_updated=True)
        completeness_count(profile)
        if (
            ProfileImage.BANNER in serializer.validated_data.keys()
            or ProfileImage.LOGO in serializer.validated_data.keys()
        ):
            deletion_checker = ApprovedImagesDeleter(profile)
            deletion_checker.handle_potential_deletion()
            moderation_manager = ModerationManager(profile)
            if (
                moderation_manager.check_for_moderation()
                or moderation_manager.content_deleted
            ):
                banner = moderation_manager.images["banner"]
                logo = moderation_manager.images["logo"]
                is_deleted = moderation_manager.content_deleted
                send_moderation_email(profile, banner, logo, is_deleted)
                moderation_manager.schedule_autoapprove()


class ProfileViewCreate(CreateAPIView):
    serializer_class = ViewedCompanySerializer
    permission_classes = ((RequestIsCreate & (~IsAuthenticated | ~IsOwner)),)

    @cached_property
    def current_user(self):
        return (
            self.request.user if self.request.user.is_authenticated else None
        )

    @cached_property
    def _profile(self):
        return get_object_or_404(
            Profile.objects.active_only(),
            pk=self.kwargs["profile_id"],
        )

    def perform_create(self, serializer):
        serializer.save(user=self.current_user, company=self._profile)


class CategoryList(ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = (RequestIsReadOnly | IsAdminUser,)
    queryset = Category.objects.all()


class ActivityList(ListCreateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = (RequestIsReadOnly | IsAdminUser,)
    queryset = Activity.objects.all()


class RegionList(ListCreateAPIView):
    serializer_class = RegionSerializer
    permission_classes = (RequestIsReadOnly | IsAdminUser,)
    queryset = Region.objects.all()


class CategoryDetail(RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = (IsAdminUser,)
    queryset = Category.objects.all()


class ActivityDetail(RetrieveUpdateDestroyAPIView):
    serializer_class = ActivitySerializer
    permission_classes = (IsAdminUser,)
    queryset = Activity.objects.all()


class RegionDetail(RetrieveUpdateDestroyAPIView):
    serializer_class = RegionSerializer
    permission_classes = (IsAdminUser,)
    queryset = Region.objects.all()


class ProfileModeration(UpdateAPIView):
    serializer_class = ProfileModerationSerializer
    queryset = Profile.objects.all()
    lookup_url_kwarg = "profile_id"

    def get_object(self):
        try:
            profile_id = decode_id(self.kwargs.get(self.lookup_url_kwarg))
        except ValueError:
            raise Http404

        return get_object_or_404(self.queryset, pk=profile_id)

    def perform_update(self, serializer):
        profile = serializer.save()
        completeness_count(profile)
