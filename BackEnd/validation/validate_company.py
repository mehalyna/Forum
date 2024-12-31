from django.core.exceptions import ValidationError
import re


def validate_company_name(value: str):
    """
    Validate company name: allows up to 100 characters and supports Ukrainian letters and common symbols.
    """
    if len(value) > 100:
        raise ValidationError("Company name must not exceed 100 characters.")
    if not re.match(r'^[\w\s.,\'"–-]+$', value):
        raise ValidationError("Company name contains invalid characters.")


def validate_address(value: str):
    """
    Validate address: must contain alphanumeric characters and special symbols (e.g., commas, periods).
    """
    if not re.match(r"^[\w\s.,-]+$", value):
        raise ValidationError(
            "Address must contain only alphanumeric characters and valid symbols (e.g., commas, periods)."
        )
