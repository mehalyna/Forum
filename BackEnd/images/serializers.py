from rest_framework import serializers
from images.models import ProfileImage
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

from validation.validate_image import (
    validate_banner_size,
    validate_logo_size,
)


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileImage
        fields = (
            "uuid",
            "image_type",
            "image_path",
            "cropped_image_path",
            "created_by",
            "content_type",
            "image_size",
            "hash_md5",
            "is_approved",
            "is_deleted",
            "created_at",
        )
        read_only_fields = (
            "uuid",
            "created_at",
            "created_by",
            "image_type",
            "content_type",
            "image_size",
            "hash_md5",
            "is_approved",
            "is_deleted",
        )

    def validate(self, value):
        validator_function = {
            ProfileImage.BANNER: validate_banner_size,
            ProfileImage.LOGO: validate_logo_size,
        }[self.context["view"].kwargs["image_type"]]

        validator_function(value.get("image_path"))

        return value
