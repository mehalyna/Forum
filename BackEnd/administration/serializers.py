from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import ValidationError
from utils.administration.feedback_category import FeedbackCategoryEnum
from authentication.models import CustomUser
from profiles.models import (
    Profile,
    Region,
    Activity,
    Category,
)
from utils.regions_ukr_names import get_regions_ukr_names_as_string
from utils.administration.profiles.profiles_functions import (
    format_company_type,
    format_business_entity,
)
from utils.administration.create_password import generate_password
from utils.administration.send_email import send_email_about_admin_registration
from utils.moderation.encode_decode_id import encode_id
from .models import (
    AutoModeration,
    ModerationEmail,
    ContactInformation,
    FeedbackCategory,
)
from validation.validate_phone_number import (
    validate_phone_number_len,
    validate_phone_number_is_digit,
)
from validation.validate_company import validate_address, validate_company_name

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


class ProfileImageField(serializers.Field):
    def to_representation(self, value):
        if value.is_deleted == False:
            return {
                "uuid": value.uuid,
                "path": self.context["request"].build_absolute_uri(
                    value.image_path.url
                ),
                "is_approved": value.is_approved,
            }


class AdminCompanyDetailSerializer(serializers.ModelSerializer):
    person = AdminUserDetailSerializer(read_only=True)
    categories = serializers.SlugRelatedField(
        many=True, slug_field="name", read_only=True
    )
    activities = serializers.SlugRelatedField(
        many=True, slug_field="name", read_only=True
    )
    regions = AdminRegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageField(read_only=True)
    logo = ProfileImageField(read_only=True)
    banner_approved = serializers.ImageField(
        source="banner_approved.image_path", required=False
    )
    logo_approved = serializers.ImageField(
        source="logo_approved.image_path", required=False
    )
    encoded_id = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "encoded_id",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "person",
            "person_position",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "phone",
            "edrpou",
            "rnokpp",
            "status",
            "founded",
            "service_info",
            "product_info",
            "address",
            "startup_idea",
            "banner",
            "banner_approved",
            "logo",
            "logo_approved",
            "is_deleted",
        )

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)

    def get_encoded_id(self, obj) -> str:
        return encode_id(obj.id)


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


class FeedbackCategoryField(serializers.Field):
    """
    Custom serializer field for handling FeedbackCategory.
    Converts category name to object and vice versa.
    """

    def to_representation(self, value):
        return value.name

    def to_internal_value(self, data):
        if not data:
            category, _ = FeedbackCategory.objects.get_or_create(name="Інше")
        else:
            category = FeedbackCategory.objects.filter(name=data).first()
            if not category:
                raise serializers.ValidationError(
                    "The selected category does not exist."
                )
        return category


class FeedbackSerializer(serializers.Serializer):
    """
    Serializer for handling user feedback messages.
    """

    email = serializers.EmailField(
        required=True,
        error_messages={
            "required": "Please provide a valid email address.",
            "invalid": "Enter a valid email address.",
        },
    )
    message = serializers.CharField(
        min_length=10,
        required=True,
        error_messages={
            "required": "Message cannot be empty.",
            "min_length": "Message must be at least 10 characters long.",
        },
    )
    category = FeedbackCategoryField(required=False)


class FeedbackCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for handling FeedbackCategory CRUD operations.
    """

    name = serializers.CharField(
        max_length=50,
        validators=[
            UniqueValidator(
                queryset=FeedbackCategory.objects.all(),
                message="A category with this name already exists.",
            )
        ],
        error_messages={
            "blank": "Category name cannot be empty.",
            "required": "Category name is required.",
            "max_length": "Category name cannot exceed 50 characters.",
        },
    )

    class Meta:
        model = FeedbackCategory
        fields = ("id", "name")


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
    manufacturers_count = serializers.IntegerField()
    importers_count = serializers.IntegerField()
    retail_networks_count = serializers.IntegerField()
    horeca_count = serializers.IntegerField()
    others_count = serializers.IntegerField()


class ContactInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInformation
        fields = [
            "company_name",
            "address",
            "email",
            "phone",
            "updated_at",
            "admin_user",
        ]
        read_only_fields = ["updated_at", "admin_user"]

    def validate_phone(self, value):
        errors = []
        try:
            validate_phone_number_len(value)
        except ValidationError as error:
            errors.append(error.message)

        try:
            validate_phone_number_is_digit(value)
        except ValidationError as error:
            errors.append(error.message)

        if errors:
            raise serializers.ValidationError(errors)

        return value

    def validate_address(self, value):
        validate_address(value)
        return value

    def validate_company_name(self, value):
        validate_company_name(value)
        return value


class MonthlyProfileStatisticsSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    investors_count = serializers.IntegerField()
    startups_count = serializers.IntegerField()
    startup_investor_count = serializers.IntegerField()


class SendMessageSerializer(serializers.Serializer):
    """
    Serializer for sending custom messages to users.
    """

    email = serializers.EmailField(
        required=True,
        error_messages={
            "required": "Please provide a valid email address.",
            "invalid": "Enter a valid email address.",
        },
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
        choices=FeedbackCategoryEnum.choices(),
        required=True,
        error_messages={
            "required": "Please select a category.",
            "invalid_choice": "Invalid category selection.",
        },
    )
