from django.core.exceptions import ValidationError
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

MAX_ALLOWED_BANNER_IMAGE_SIZE = 5 * 1024 * 1024
MAX_ALLOWED_LOGO_IMAGE_SIZE = 1 * 1024 * 1024
# ToDo: discuss problem with MB-sized pictures with mentors, experts and BAs


def validate_image_format(image: Image):
    valid_formats = ["PNG", "JPEG"]
    img = Image.open(image)
    format_ = img.format
    if format_ not in valid_formats:
        raise ValidationError(
            "Unsupported image format. Only PNG and JPEG are allowed."
        )


def validate_image_size(image_file):
    max_size = image_file.size
    if max_size > MAX_ALLOWED_BANNER_IMAGE_SIZE:
        raise ValidationError("Image size exceeds the maximum allowed (50MB).")


def validate_logo_size(image_file):
    max_size = image_file.size
    if max_size > MAX_ALLOWED_LOGO_IMAGE_SIZE:
        raise ValidationError("Image size exceeds the maximum allowed (10MB).")
