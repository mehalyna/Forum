from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from utils.administration.feedback_category import FeedbackCategory
from authentication.models import CustomUser
from profiles.models import (
    Profile,
    Region,
    Activity,
    Category,
)
from utils.administration.profiles.profiles_functions import (
    format_company_type,
    format_business_entity,
)
from utils.administration.create_password import generate_password
from utils.administration.send_email import send_email_about_admin_registration
from .models import AutoModeration, ModerationEmail

User = get_user_model()


class AdminRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = (
            "id",
            "name_ukr",
        )


class ActivitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
        )


class AdminRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(
        write_only=True,
    )

    def validate(self, value):
        email = value.get("email").lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "Email is already registered"}
            )

        return value

    def create(self, validated_data):
        email = validated_data.get("email")
        password = generate_password()
        admin = User.objects.create(
            email=email,
            is_staff=True,
            is_active=True,
        )
        admin.set_password(password)
        admin.save()
        send_email_about_admin_registration(email, password)
        return admin


class AdminUserListSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    registration_date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "email",
            "name",
            "surname",
            "status",
            "company_name",
            "registration_date",
        )

    def get_company_name(self, obj) -> str:
        return obj.profile.name if hasattr(obj, "profile") else None

    def get_registration_date(self, obj) -> str:
        return obj.profile.created_at if hasattr(obj, "profile") else None

    def get_status(self, obj) -> dict:
        data = {
            "is_active": obj.is_active,
            "is_staff": obj.is_staff,
            "is_superuser": obj.is_superuser,
            "is_deleted": obj.email.startswith("is_deleted_"),
            "is_inactive": not obj.is_active
            and not obj.email.startswith("is_deleted_"),
        }
        return data


class AdminUserDetailSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "name",
            "surname",
            "email",
            "is_active",
            "is_staff",
            "is_superuser",
            "company_name",
        )

    def get_company_name(self, obj) -> bool:
        return True if hasattr(obj, "profile") else False


class AdminCompanyListSerializer(serializers.ModelSerializer):
    person = AdminUserDetailSerializer(read_only=True)
    company_type = serializers.SerializerMethodField(read_only=True)
    activities = ActivitiesSerializer(many=True, read_only=True)
    representative = serializers.CharField(read_only=True)
    business_entity = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "person",
            "business_entity",
            "phone",
            "address",
            "status",
            "updated_at",
            "created_at",
            "is_deleted",
            "company_type",
            "activities",
            "representative",
        )

    def get_company_type(self, obj) -> str:
        return format_company_type(obj)

    def get_business_entity(self, obj) -> str:
        return format_business_entity(obj)


class AdminCompanyDetailSerializer(serializers.ModelSerializer):
    person = AdminUserDetailSerializer(read_only=True)
    categories = serializers.SlugRelatedField(
        many=True, slug_field="name", read_only=True
    )
    activities = serializers.SlugRelatedField(
        many=True, slug_field="name", read_only=True
    )
    regions = AdminRegionSerializer(many=True, read_only=True)
    banner_image = serializers.ImageField(
        source="banner.image_path", required=False
    )
    logo_image = serializers.ImageField(
        source="logo.image_path", required=False
    )
    banner_approved_image = serializers.ImageField(
        source="banner_approved.image_path", required=False
    )
    logo_approved_image = serializers.ImageField(
        source="logo_approved.image_path", required=False
    )

    class Meta:
        model = Profile
        fields = (
            "name",
            "is_registered",
            "is_startup",
            "categories",
            "activities",
            "person",
            "person_position",
            "official_name",
            "regions",
            "common_info",
            "phone",
            "edrpou",
            "founded",
            "service_info",
            "product_info",
            "address",
            "startup_idea",
            "banner",
            "logo",
            "banner_approved",
            "logo_approved",
            "banner_image",
            "banner_approved_image",
            "logo_image",
            "logo_approved_image",
            "is_deleted",
        )


class AutoModerationHoursSerializer(serializers.ModelSerializer):
    auto_moderation_hours = serializers.IntegerField(min_value=1, max_value=48)

    class Meta:
        model = AutoModeration
        fields = ("auto_moderation_hours",)


class ModerationEmailSerializer(serializers.ModelSerializer):
    email_moderation = serializers.EmailField()

    class Meta:
        model = ModerationEmail
        fields = ["email_moderation"]


class FeedbackSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={"required": "Please provide a valid email address."},
    )
    message = serializers.CharField(
        min_length=10,
        required=True,
        error_messages={
            "required": "Message cannot be empty.",
            "min_length": "Message must be at least 10 characters long.",
        },
    )
    category = serializers.ChoiceField(
        choices=FeedbackCategory.choices(),
        required=True,
        error_messages={"required": "Please select a category."},
    )


class CategoriesListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Category.objects.all(),
                message="Category with this name already exists.",
            )
        ]
    )

    class Meta:
        model = Category
        fields = ("id", "name")


class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("name",)


class StatisticsSerializer(serializers.Serializer):
    companies_count = serializers.IntegerField()
    investors_count = serializers.IntegerField()
    startups_count = serializers.IntegerField()
    blocked_companies_count = serializers.IntegerField()


class StatisticsActivitiesSerializer(serializers.Serializer):
    manufacturers_count = serializers.IntegerField()
    importers_count = serializers.IntegerField()
    retail_networks_count = serializers.IntegerField()
    horeca_count = serializers.IntegerField()
    others_count = serializers.IntegerField()


class MonthlyProfileStatisticsSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    investors_count = serializers.IntegerField()
    startups_count = serializers.IntegerField()
    startup_investor_count = serializers.IntegerField()
