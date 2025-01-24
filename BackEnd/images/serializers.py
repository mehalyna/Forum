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
    crop_x = serializers.IntegerField(write_only=True)
    crop_y = serializers.IntegerField(write_only=True)
    width = serializers.IntegerField(write_only=True)
    height = serializers.IntegerField(write_only=True)
    class Meta:
        model = ProfileImage
        fields = (
            "uuid",
            "image_type",
            "image_path",
            "created_by",
            "content_type",
            "image_size",
            "hash_md5",
            "is_approved",
            "is_deleted",
            "created_at",
            "crop_x",
            "crop_y",
            "width",
            "height",
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

    def create(self, validated_data):
        cropped_image_x_point = validated_data.pop("crop_x", 0)
        cropped_image_y_point = validated_data.pop("crop_y", 0)
        width = validated_data.pop("width", 0)
        height = validated_data.pop("height", 0)

        if (cropped_image_x_point and 
            cropped_image_y_point and 
            width and
            height):

            image = validated_data.get("image_path")
            format = validated_data.get("content_type").upper()
            if format == "JPG":
                format = "JPEG"

            dimensions = (
                cropped_image_x_point,
                cropped_image_y_point,
                cropped_image_x_point + width,
                cropped_image_y_point + height
            )
            img = Image.open(image)
            cropped_img = img.crop(dimensions)
            buffer = BytesIO()
            cropped_img.save(buffer, format=format)
            buffer.seek(0)

            image_content = ContentFile(buffer.getvalue(), name=image.name)
            validated_data["image_path"] = image_content
            validated_data["image_size"] = image_content.size

        return super().create(validated_data)






