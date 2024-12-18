from django.contrib.auth import get_user_model
from rest_framework import serializers
from utils.administration.feedback_category import FeedbackCategory
from authentication.models import CustomUser
from profiles.models import (
    Profile,
    Region, Activity,
)
from utils.administration.profiles.profiles import get_company_type_as_string, get_representative_as_string, \
    get_business_entity_as_string
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
    regions = AdminRegionSerializer(many=True, read_only=True)
    company_type = serializers.SerializerMethodField(read_only=True)
    activities = ActivitiesSerializer(many=True, read_only=True)
    representative = serializers.SerializerMethodField(read_only=True)
    business_entity = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "is_registered",
            "person",
            "person_position",
            "regions",
            "business_entity",
            "phone",
            "edrpou",
            "address",
            "status",
            "updated_at",
            "created_at",
            "is_deleted",
            "company_type",
            "activities",
            "representative",
        )

    @staticmethod
    def get_company_type(obj) -> str:
        return get_company_type_as_string(obj)

    @staticmethod
    def get_representative(obj):
        return get_representative_as_string(obj)

    @staticmethod
    def get_business_entity(obj):
        return get_business_entity_as_string(obj)


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
