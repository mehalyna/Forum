from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from django.utils.timezone import now
from .models import (
    Profile,
    Activity,
    Category,
    SavedCompany,
    ViewedCompany,
    Region,
)
from images.models import ProfileImage
from utils.regions_ukr_names import get_regions_ukr_names_as_string
from utils.moderation.moderation_action import ModerationAction
from utils.moderation.image_moderation import ModerationManager


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = "__all__"


@extend_schema_field(
    {
        "type": "object",
        "properties": {
            "uuid": {"type": "string", "format": "uuid"},
            "path": {"type": "string", "format": "uri"},
        },
    }
)
class ProfileImageField(serializers.Field):
    def to_representation(self, value):
        if value.is_deleted == False:
            return {
                "uuid": value.uuid,
                "path": self.context["request"].build_absolute_uri(
                    value.image_path.url
                ),
            }

    def to_internal_value(self, data):
        return ProfileImage.objects.filter(uuid=data, is_deleted=False).first()


class ProfileImageFieldApprovedStatus(ProfileImageField):
    def to_representation(self, value):
        if not value.is_deleted:
            return {
                "uuid": value.uuid,
                "path": self.context["request"].build_absolute_uri(
                    value.image_path.url
                ),
                "is_approved": value.is_approved,
            }


class ProfileListSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    saved_is_updated = serializers.SerializerMethodField()
    regions = RegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageField(source="banner_approved", read_only=True)
    logo = ProfileImageField(source="logo_approved", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "person",
            "is_registered",
            "is_startup",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "address",
            "founded",
            "categories",
            "activities",
            "banner",
            "logo",
            "is_saved",
            "saved_is_updated",
        )

    def get_is_saved(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_authenticated:
            return obj.pk in self.context["saved_companies_pk"]
        return False

    def get_saved_is_updated(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_authenticated:
            saved_company = SavedCompany.objects.filter(
                user=user, company=obj
            ).first()
            if saved_company:
                return saved_company.is_updated
        return False

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)


class ProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class ProfileDetailSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    saved_is_updated = serializers.SerializerMethodField()
    regions = RegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageField(source="banner_approved", read_only=True)
    logo = ProfileImageField(source="logo_approved", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "edrpou",
            "rnokpp",
            "founded",
            "address",
            "startup_idea",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "service_info",
            "product_info",
            "banner",
            "logo",
            "is_saved",
            "saved_is_updated",
        )
        read_only_fields = (
            "id",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "edrpou",
            "rnokpp",
            "founded",
            "address",
            "startup_idea",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "service_info",
            "product_info",
            "banner",
            "logo",
        )

    def get_is_saved(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_authenticated:
            return obj.pk in self.context["saved_companies_pk"]
        return False

    def get_saved_is_updated(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_authenticated:
            saved_company = SavedCompany.objects.filter(
                user=user, company=obj
            ).first()
            if saved_company:
                return saved_company.is_updated
        return False

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)


class ProfileOwnerDetailViewSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source="person.email")
    activities = ActivitySerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    email = serializers.ReadOnlyField(source="person.email")
    regions = RegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageFieldApprovedStatus()
    logo = ProfileImageFieldApprovedStatus()

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "person",
            "email",
            "person_position",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "phone",
            "edrpou",
            "rnokpp",
            "founded",
            "service_info",
            "product_info",
            "address",
            "startup_idea",
            "banner",
            "logo",
            "is_deleted",
            "status",
            "status_updated_at",
        )
        read_only_fields = (
            "id",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "person",
            "email",
            "person_position",
            "official_name",
            "regions",
            "regions_ukr_display",
            "common_info",
            "phone",
            "edrpou",
            "rnokpp",
            "founded",
            "service_info",
            "product_info",
            "address",
            "startup_idea",
            "banner",
            "logo",
            "is_deleted",
            "status",
            "status_updated_at",
        )

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)


class ProfileOwnerDetailEditSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source="person.email")
    banner = ProfileImageField(allow_null=True)
    logo = ProfileImageField(allow_null=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "is_registered",
            "is_startup",
            "is_fop",
            "categories",
            "activities",
            "person",
            "email",
            "person_position",
            "official_name",
            "regions",
            "common_info",
            "phone",
            "edrpou",
            "rnokpp",
            "founded",
            "service_info",
            "product_info",
            "address",
            "startup_idea",
            "banner",
            "logo",
            "is_deleted",
        )
        read_only_fields = ("person",)

    def validate(self, data):
        edrpou = data.get("edrpou", self.instance.edrpou)
        rnokpp = data.get("rnokpp", self.instance.rnokpp)
        is_fop = data.get("is_fop", self.instance.is_fop)
        name = data.get("name", self.instance.name)
        if rnokpp and not is_fop:
            raise serializers.ValidationError(
                {
                    "is_fop": "For the RNOKPP field filled out, FOP must be set to True"
                }
            )
        if edrpou and is_fop:
            raise serializers.ValidationError(
                {
                    "is_fop": "For the EDRPOU field filled out, FOP must be set to False"
                }
            )
        if name and len(name) > 45:
            raise serializers.ValidationError(
                {"name": "Ensure this field has no more than 45 characters."}
            )

        return data

    # set optional unique fields to None if they are empty
    def to_internal_value(self, data):
        fields_to_check = ["edrpou", "rnokpp"]
        for field in fields_to_check:
            if data.get(field) == "":
                data[field] = None
        return super().to_internal_value(data)


class ProfileDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)

    def validate_password(self, data):
        user = self.context["request"].user
        if not user.check_password(data):
            raise serializers.ValidationError("Invalid password")
        return data


class ProfileSensitiveDataROSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source="person.email")

    class Meta:
        model = Profile
        fields = (
            "phone",
            "email",
        )
        read_only_fields = (
            "phone",
            "email",
        )


class SavedCompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCompany
        fields = ("is_updated",)


class SavedCompanySerializer(serializers.ModelSerializer):
    company_pk = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedCompany
        fields = (
            "id",
            "user",
            "company",
            "company_pk",
            "added_at",
            "is_updated",
        )
        read_only_fields = [
            "user",
            "company",
        ]

    def validate(self, attrs):
        user = self.context["request"].user
        company_pk = attrs["company_pk"]
        if not Profile.objects.filter(pk=company_pk).exists():
            raise serializers.ValidationError(
                {"company_pk": ["Company does not exist"]}
            )
        if SavedCompany.objects.filter(user=user, company=company_pk).exists():
            raise serializers.ValidationError(
                {
                    "company_pk": [
                        "Company is already in users saved companies list"
                    ]
                }
            )
        return attrs

    def create(self, validated_data):
        company = Profile.objects.get(pk=validated_data.pop("company_pk"))
        saved_company = SavedCompany.objects.create(
            user=self.context["request"].user,
            company=company,
            **validated_data,
        )
        return saved_company


class ViewedCompanySerializer(serializers.ModelSerializer):
    user_profile_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = ViewedCompany
        fields = (
            "id",
            "user",
            "company",
            "date",
            "user_profile_name",
            "company_name",
        )
        read_only_fields = (
            "user",
            "company",
        )

    def get_user_profile_name(self, obj) -> str:
        if obj.user:
            return obj.user_profile_name
        return None

    def get_company_name(self, obj) -> str:
        return obj.company_name


class ProfileModerationSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=ModerationAction.choices(),
        error_messages={"invalid_choice": "Action is not allowed"},
        write_only=True,
    )
    banner = ProfileImageField(write_only=True)
    logo = ProfileImageField(write_only=True)
    status_updated_at = serializers.DateTimeField(read_only=True)
    status = serializers.CharField(read_only=True)

    def validate(self, attrs):
        profile = self.instance
        banner = attrs.get("banner")
        logo = attrs.get("logo")

        if not logo and not banner:
            raise serializers.ValidationError(
                "At least one image (logo or banner) must be provided for the moderation request."
            )

        if profile.status != profile.PENDING:
            raise serializers.ValidationError(
                "The change approval request has been processed. URL is outdated"
            )
        else:
            if (banner and profile.banner != banner) or (
                logo and profile.logo != logo
            ):
                raise serializers.ValidationError(
                    "There is a new request for moderation. URL is outdated"
                )
        return attrs

    def update(self, instance, validated_data):
        action = validated_data.get("action")
        banner = validated_data.get("banner")
        logo = validated_data.get("logo")

        if action == ModerationAction.approve:
            if banner:
                instance.banner.is_approved = True
                instance.banner_approved = banner
                instance.banner.save()
            if logo:
                instance.logo.is_approved = True
                instance.logo_approved = logo
                instance.logo.save()
            instance.status = instance.APPROVED

        elif action == ModerationAction.reject:
            instance.status = instance.BLOCKED
            instance.is_deleted = True
            instance.person.is_active = False
            instance.person.save()

        moderation_manager = ModerationManager(profile=instance)
        moderation_manager.revoke_deprecated_autoapprove()

        instance.status_updated_at = now()
        instance.save()
        return instance
