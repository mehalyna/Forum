from django.db import models
from django.core.validators import MaxLengthValidator
from django.utils.timezone import now

from authentication.models import CustomUser
from images.models import ProfileImage
from .managers import ProfileManager
from validation.validate_edrpou import validate_edrpou
from validation.validate_rnokpp import validate_rnokpp
from validation.validate_foundation_year import validate_foundation_year_range
from validation.validate_phone_number import (
    validate_phone_number_len,
    validate_phone_number_is_digit,
)


class Region(models.Model):
    id = models.AutoField(primary_key=True)
    name_eng = models.CharField(max_length=150, unique=True)
    name_ukr = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name_ukr


class Profile(models.Model):
    UNDEFINED = "undefined"
    PENDING = "pending"
    BLOCKED = "blocked"
    APPROVED = "approved"
    AUTOAPPROVED = "auto_approved"

    STATUS_CHOICES = [
        (UNDEFINED, "Undefined"),
        (PENDING, "Pending Moderation"),
        (BLOCKED, "Blocked"),
        (APPROVED, "Approved"),
        (AUTOAPPROVED, "Auto Approved"),
    ]

    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=45, default=None, null=True)
    is_registered = models.BooleanField(default=None, null=True)
    is_startup = models.BooleanField(default=None, null=True)
    is_fop = models.BooleanField(default=False)

    categories = models.ManyToManyField("Category")
    activities = models.ManyToManyField("Activity")

    person = models.OneToOneField(CustomUser, on_delete=models.PROTECT)
    person_position = models.CharField(max_length=50, blank=True, default="")

    official_name = models.CharField(max_length=255, null=True, default=None)

    regions = models.ManyToManyField("Region", blank=True)
    common_info = models.TextField(
        validators=[MaxLengthValidator(1000)], default=""
    )
    phone = models.CharField(
        max_length=12,
        validators=[validate_phone_number_is_digit, validate_phone_number_len],
        blank=True,
        default="",
    )
    edrpou = models.CharField(
        max_length=8,
        unique=True,
        validators=[validate_edrpou],
        default=None,
        blank=True,
        null=True,
    )
    rnokpp = models.CharField(
        max_length=10,
        unique=True,
        validators=[validate_rnokpp],
        default=None,
        blank=True,
        null=True,
    )
    founded = models.SmallIntegerField(
        validators=[validate_foundation_year_range],
        default=None,
        null=True,
    )
    service_info = models.TextField(blank=True, default="")
    product_info = models.TextField(blank=True, default="")
    address = models.TextField(blank=True, default="")
    startup_idea = models.TextField(blank=True, default="")

    banner = models.ForeignKey(
        ProfileImage,
        on_delete=models.CASCADE,
        related_name="profile_banner",
        null=True,
        blank=True,
        default=None,
    )
    logo = models.ForeignKey(
        ProfileImage,
        on_delete=models.CASCADE,
        related_name="profile_logo",
        null=True,
        blank=True,
        default=None,
    )
    banner_approved = models.ForeignKey(
        ProfileImage,
        on_delete=models.CASCADE,
        related_name="profile_banner_approved",
        null=True,
        blank=True,
        default=None,
    )
    logo_approved = models.ForeignKey(
        ProfileImage,
        on_delete=models.CASCADE,
        related_name="profile_logo_approved",
        null=True,
        blank=True,
        default=None,
    )

    is_deleted = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    status_updated_at = models.DateTimeField(default=now)
    completeness = models.SmallIntegerField(default=0)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default=UNDEFINED
    )

    objects = ProfileManager.as_manager()


class Activity(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class SavedCompany(models.Model):
    company = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="saved_list"
    )
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="saved_list_items"
    )
    added_at = models.DateTimeField(auto_now_add=True)
    is_updated = models.BooleanField(default=False)


class ViewedCompany(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, blank=True, null=True
    )
    company = models.ForeignKey(Profile, on_delete=models.CASCADE)

    @property
    def user_profile_name(self):
        return self.user.profile.name

    @property
    def company_name(self):
        return self.company.name
