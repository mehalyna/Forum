from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from profiles.models import Profile
from images.models import ProfileImage
from profiles.serializers import (
    CategorySerializer,
    ActivitySerializer,
    RegionSerializer,
)
from utils.regions_ukr_names import get_regions_ukr_names_as_string


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
                "cropped_path": (
                    self.context["request"].build_absolute_uri(
                        value.cropped_image_path.url
                    )
                    if value.cropped_image_path
                    else None
                ),
            }
        return None

    def to_internal_value(self, data):
        return ProfileImage.objects.filter(uuid=data, is_deleted=False).first()


class CompanySerializers(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    regions = RegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageField(source="banner_approved", read_only=True)
    logo = ProfileImageField(source="logo_approved", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "categories",
            "activities",
            "regions",
            "regions_ukr_display",
            "founded",
            "address",
            "banner",
            "logo",
            "person",
            "is_saved",
        )

    def get_is_saved(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_authenticated:
            return obj.pk in self.context["saved_companies_pk"]
        return False

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)


class CompanyAdvancedSerializers(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    regions = RegionSerializer(many=True, read_only=True)
    regions_ukr_display = serializers.SerializerMethodField()
    banner = ProfileImageField(source="banner_approved", read_only=True)
    logo = ProfileImageField(source="logo_approved", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "official_name",
            "categories",
            "activities",
            "regions",
            "regions_ukr_display",
            "common_info",
            "service_info",
            "product_info",
            "founded",
            "address",
            "banner",
            "logo",
            "person",
        )

    def get_regions_ukr_display(self, obj) -> str:
        return get_regions_ukr_names_as_string(obj)
