from django.db.models.functions import Concat
from django.db.models import F, Value, CharField
from django.http import JsonResponse
from django.views import View
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes

from drf_spectacular.utils import (
    extend_schema,
    OpenApiExample,
    OpenApiResponse,
    OpenApiParameter,
)
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveUpdateAPIView,
    CreateAPIView,
)

from rest_framework.response import Response
from rest_framework import status

from administration.serializers import AdminRegistrationSerializer
from administration.serializers import (
    AdminCompanyListSerializer,
    AdminCompanyDetailSerializer,
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AutoModerationHoursSerializer,
    ModerationEmailSerializer,
    CategoriesListSerializer,
    CategoryDetailSerializer,
    StatisticsSerializer,
    ContactInformationSerializer,
)
from administration.pagination import ListPagination
from administration.models import (
    AutoModeration,
    ModerationEmail,
    ContactInformation,
)
from authentication.models import CustomUser
from profiles.models import Profile, Category
from .permissions import IsStaffUser, IsStaffUserOrReadOnly, IsSuperUser
from .serializers import FeedbackSerializer
from utils.administration.send_email_feedback import send_email_feedback
from .filters import (
    UsersFilter,
    CategoriesFilter,
    ProfilesFilter,
    ProfileStatisticsFilter,
)
from utils.administration.send_email_notification import send_email_to_user
from utils.administration.backup_contact_info import (
    backup_contact_info,
    update_cache,
)


class UsersListView(ListAPIView):
    """
    View to list users with optional filtering and ordering.

    ### Query Parameters:
    -  **name** / **surname** /**email** /  **is_active** /  **is_staff** /
    - **is_superuser** / **is_deleted**/ **company_name** /  **registration_date**

    ### Ordering:
    - Use the `ordering` parameter to sort the results.
    - Example: `/users/?ordering=id` (ascending by ID) or `/users/?ordering=-id` (descending by ID).

    ### Filters:
    - Filters are applied using `DjangoFilterBackend`. All the above query parameters are supported for filtering.
    **Without is_deleted**
    """

    permission_classes = [IsStaffUser]
    pagination_class = ListPagination
    serializer_class = AdminUserListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UsersFilter
    queryset = CustomUser.objects.select_related("profile").order_by("id")


class UserDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user.
    """

    permission_classes = [IsStaffUser]
    serializer_class = AdminUserDetailSerializer
    queryset = CustomUser.objects.select_related("profile")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not Profile.objects.filter(person_id=instance.id).exists():
            return super().destroy(request, *args, **kwargs)
        else:
            return self.http_method_not_allowed(request, *args, **kwargs)


class ProfilesListView(ListAPIView):
    """
    View to list profiles with optional filtering and ordering.
    """

    permission_classes = [IsStaffUser]
    pagination_class = ListPagination
    serializer_class = AdminCompanyListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfilesFilter
    queryset = (
        Profile.objects.select_related("person")
        .prefetch_related("activities")
        .order_by("id")
        .annotate(
            representative=Concat(
                F("person__name"),
                Value(" "),
                F("person__surname"),
                output_field=CharField(),
            )
        )
    )


class ProfileDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a Profiles.
    """

    permission_classes = [IsStaffUser]
    serializer_class = AdminCompanyDetailSerializer
    queryset = Profile.objects.select_related("person").prefetch_related(
        "regions", "categories", "activities"
    )


@extend_schema(
    parameters=[
        OpenApiParameter("start_date", OpenApiTypes.DATE),
        OpenApiParameter("end_date", OpenApiTypes.DATE),
        OpenApiParameter("day", OpenApiTypes.DATE),
        OpenApiParameter("month", OpenApiTypes.STR),
        OpenApiParameter("year", OpenApiTypes.STR),
    ]
)
class ProfileStatisticsView(RetrieveAPIView):
    """
    Count of companies

    ### Query Parameters:
    - **start_date**  (format: **YYYY-MM-DD**)
    - **end_date** (format: **YYYY-MM-DD**)
    - **day** (format: **YYYY-MM-DD**)
    - **month** (format: **YYYY-MM**)
    - **year** (format: **YYYY**)
    """

    permission_classes = [IsStaffUser]
    serializer_class = StatisticsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfileStatisticsFilter

    def get_object(self):
        queryset = self.filter_queryset(Profile.objects.all())
        return queryset.aggregate(
            companies_count=Count("pk"),
            investors_count=Count("pk", filter=Q(is_registered=True)),
            startups_count=Count("pk", filter=Q(is_startup=True)),
            blocked_companies_count=Count("pk", filter=Q(status="blocked")),
        )


@extend_schema(
    request=AutoModerationHoursSerializer,
    responses={
        200: OpenApiResponse(
            response=AutoModerationHoursSerializer,
            examples=[
                OpenApiExample(
                    "Valid example",
                    summary="Valid example",
                    description="A valid example with auto_moderation_hours set to 24",
                    value={"auto_moderation_hours": 24},
                )
            ],
        ),
        400: OpenApiResponse(
            response=AutoModerationHoursSerializer,
            examples=[
                OpenApiExample(
                    "Invalid example",
                    summary="Invalid example",
                    description="An invalid example with auto_moderation_hours set to 50 (out of range)",
                    value={"auto_moderation_hours": 50},
                )
            ],
        ),
    },
)
class AutoModerationHoursView(RetrieveUpdateAPIView):
    """
    View for retrieving and updating 'auto_moderation_hours' - a value that sets
    the auto-approve delay (part of the moderation functionality).
    Value must be an integer between 1 and 48
    """

    permission_classes = [IsStaffUserOrReadOnly]
    serializer_class = AutoModerationHoursSerializer

    def get_object(self):
        return AutoModeration.get_auto_moderation_hours()


class ModerationEmailView(RetrieveUpdateAPIView):
    """
    View for retrieving and updating the ModerationEmail instance.
    Requires the user to be a superuser.
    """

    permission_classes = [IsSuperUser]
    serializer_class = ModerationEmailSerializer

    def get_object(self):
        return ModerationEmail.objects.first()


class ContactsView(RetrieveUpdateAPIView):
    """
    API view for retrieving and updating contact information.
    """

    permission_classes = [IsStaffUser]
    serializer_class = ContactInformationSerializer

    def get_object(self):
        """
        Always returns the single contact information record.
        If no record exists, a new one is created.
        """
        contact, _ = ContactInformation.objects.get_or_create(pk=1)
        return contact

    def update(self, request, *args, **kwargs):
        """
        Updates contact information and creates a backup.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        if serializer.is_valid():
            try:
                backup_contact_info()
            except Exception as e:
                return Response(
                    {"message": f"Backup failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            try:
                serializer.save(admin_user=request.user)

                update_cache()
                return Response(
                    {"message": "Contact information successfully updated."},
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response(
                    {"message": f"Cache update failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateAdminUserView(CreateAPIView):
    """
    View for creating an admin user.
    """

    permission_classes = [
        IsSuperUser,
    ]
    serializer_class = AdminRegistrationSerializer


class FeedbackView(CreateAPIView):
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        """
        Performs the creation of a new feedback record and sends an email notification.

        Parameters:
        - serializer (FeedbackSerializer): The serializer instance containing validated data.

        Returns:
        None

        This method extracts the email, message, and category from the validated data in the serializer.
        It then calls the `send_email_feedback` function to send an email notification with the provided feedback details.
        """
        email = serializer.validated_data["email"]
        message = serializer.validated_data["message"]
        category = serializer.validated_data["category"]

        send_email_feedback(email, message, category)


class CategoriesListView(ListCreateAPIView):
    """
    Manage categories
    ### Query Parameters:
    -  **id** / **name**

    ### Ordering:
    - Use the `ordering` parameter to sort the results.
    - Example: `/categories/?ordering=id` (ascending by ID) or `/categories/?ordering=-id` (descending by ID).

    ### Filters:
    - Filters are applied using `DjangoFilterBackend`. All the above query parameters are supported for filtering.
    """

    permission_classes = [IsStaffUser]
    serializer_class = CategoriesListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CategoriesFilter
    pagination_class = ListPagination
    queryset = Category.objects.all().order_by("id")


class CategoryDetailView(RetrieveUpdateAPIView):
    """
    Modify activity category
    """

    permission_classes = [IsStaffUser]
    serializer_class = CategoryDetailSerializer
    queryset = Category.objects.all()


class SendMessageView(CreateAPIView):
    """
    API endpoint for sending a custom email message to a specific user.

    This view allows administrators to send a message to a user's registered email.
    It validates the request payload, retrieves the user based on the provided ID,
    and sends the email using the specified category and message content.
    """

    queryset = CustomUser.objects.all()
    permission_classes = [IsStaffUser]
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        """
        Handles the email sending logic after successful validation.

        This method is executed after the request data has been validated
        by the serializer. It retrieves the user, validates their existence,
        and sends the email with the provided category and message content.

        Parameters:
            serializer (FeedbackSerializer): The serializer instance containing
            the validated data from the request.
        """
        user = self.get_object()
        email = serializer.validated_data["email"]
        category = serializer.validated_data["category"]
        message_content = serializer.validated_data["message"]

        send_email_to_user(
            user=user,
            category=category,
            message_content=message_content,
            email=email,
            sender_name="Адміністратор CraftMerge",
        )
