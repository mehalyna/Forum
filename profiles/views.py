import django_filters
from django.utils.functional import cached_property
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    ListCreateAPIView,
    DestroyAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView,
)
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    IsAdminUser,
)
from rest_framework.response import Response
from rest_framework import filters

from forum.pagination import ForumPagination
from .models import SavedCompany, Profile, Category, Activity, Region
from .permissions import (
    UserIsProfileOwnerOrReadOnly,
    IsOwnCompany,
    IsOwner,
    RequestIsReadOnly,
    RequestIsCreate,
    OnlyAdminRead,
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
)
from .filters import ProfileFilter


class SavedCompaniesCreate(ListCreateAPIView):
    """
    List of saved companies.
    Add a company to the saved list.
    """

    permission_classes = [
        IsAuthenticated,
        IsOwnCompany,
        OnlyAdminRead,
    ]
    serializer_class = SavedCompanySerializer
    pagination_class = ForumPagination

    def get_queryset(self):
        company_pk = self.kwargs["company_pk"]
        return SavedCompany.objects.filter(company=company_pk)

    def create(self, request, company_pk):
        saved_company = SavedCompany.objects.filter(
            user=self.request.user, company=company_pk
        )
        if saved_company.exists():
            saved_company_destroyer = SavedCompaniesDestroy()
            saved_company_destroyer.perform_destroy(saved_company)
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = SavedCompanySerializer(
            data={"company": company_pk, "user": self.request.user.id}
        )
        if serializer.is_valid():
            return super().create(serializer)


class SavedCompaniesDestroy(DestroyAPIView):
    """
    Remove the company from the saved list.
    """

    permission_classes = [IsAuthenticated]
    queryset = SavedCompany.objects.all()


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
        filters.OrderingFilter,
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
        queryset = Profile.objects.filter(is_deleted=False).order_by("id")
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


class ProfileDetail(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a profile instance.
    Retrieve:
        If user is a person in the profile, full info returned.
        Else profile info without sensitive data returned.
        If user is authenticated, he can get sensitive data via query param 'with_contacts'.
    """

    queryset = Profile.objects.filter(is_deleted=False)
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
        profile_instance = Profile.objects.filter(id=profile_pk).first()
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
        instance.is_deleted = True
        instance.save()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.completeness = 0
        if instance.banner_image:
            instance.completeness += 100
        if instance.logo_image:
            instance.completeness += 1
        if instance.region:
            instance.completeness += 1
        if Activity.objects.all().filter(profile=instance.id):
            instance.completeness += 1
        if Category.objects.all().filter(profile=instance.id):
            instance.completeness += 1
        instance.save()


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
            Profile.objects.filter(is_deleted=False),
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


class RegionListView(ListAPIView):
    serializer_class = RegionSerializer
    queryset = Region.choices


class CategoryDetail(RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = (IsAdminUser,)
    queryset = Category.objects.all()


class ActivityDetail(RetrieveUpdateDestroyAPIView):
    serializer_class = ActivitySerializer
    permission_classes = (IsAdminUser,)
    queryset = Activity.objects.all()
