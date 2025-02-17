from uuid import uuid4
from django.db import models
from django.core.validators import FileExtensionValidator
from authentication.models import CustomUser


def image_directory_path(instance, filename):
    return f"{instance.image_type}/{filename}"


def cropped_image_directory_path(instance, filename):
    return f"{instance.image_type}/cropped/{filename}"


class ProfileImage(models.Model):
    BANNER = "banner"
    LOGO = "logo"

    IMAGE_TYPES = (
        (BANNER, "banner"),
        (LOGO, "logo"),
    )

    uuid = models.UUIDField(primary_key=True, default=uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="created_images"
    )
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPES)
    content_type = models.CharField(max_length=5, blank=True)
    image_path = models.ImageField(
        upload_to=image_directory_path,
        validators=[
            FileExtensionValidator(allowed_extensions=["jpeg", "png", "jpg"])
        ],
        blank=True,
    )
    cropped_image_path = models.ImageField(
        upload_to=cropped_image_directory_path,
        validators=[
            FileExtensionValidator(allowed_extensions=["jpeg", "png", "jpg"])
        ],
        blank=True,
        null=True,
        default=None,
    )
    image_size = models.PositiveIntegerField(null=True)
    hash_md5 = models.CharField(max_length=32, blank=True)
    is_approved = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
