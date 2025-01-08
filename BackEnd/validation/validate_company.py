from django.core.exceptions import ValidationError
import re


def validate_company_name(value: str):

    if len(value) > 100:
        raise ValidationError("Company name must not exceed 100 characters.")

    pattern = r'^[А-Яа-яЁёЇїІіЄєҐґA-Za-z0-9\s.,:;"\'"()№\-–/@+*=?!]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            "Company name contains invalid characters. Only Ukrainian and Latin letters, "
            "numbers, and specific symbols are allowed."
        )


def validate_address(value: str):
    """
    Validate address: must contain alphanumeric characters and special symbols (e.g., commas, periods).
    """
    if not re.match(r"^[\w\s.,-]+$", value):
        raise ValidationError(
            "Address must contain only alphanumeric characters and valid symbols (e.g., commas, periods)."
        )
