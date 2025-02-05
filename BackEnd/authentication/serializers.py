from collections import defaultdict

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.conf import settings as django_settings
from djoser.conf import settings as djoser_settings
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer,
    TokenCreateSerializer,
)
from rest_framework import serializers
from utils.ratelimiters import RateLimit

from profiles.models import Profile
from validation.validate_password import (
    validate_password_long,
    validate_password_include_symbols,
)
from validation.validate_profile import validate_profile
from validation.validate_recaptcha import verify_recaptcha

User = get_user_model()


class CustomProfileSerializer(serializers.ModelSerializer):
    is_registered = serializers.BooleanField()
    is_startup = serializers.BooleanField()
    is_fop = serializers.BooleanField()

    class Meta:
        model = Profile
        fields = ("name", "is_registered", "is_startup", "is_fop")


class UserRegistrationSerializer(UserCreatePasswordRetypeSerializer):
    company = CustomProfileSerializer(write_only=True)
    email = serializers.EmailField(
        write_only=True,
    )
    password = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )
    captcha = serializers.CharField(
        write_only=True, allow_blank=True, allow_null=True
    )

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ("email", "password", "name", "surname", "company", "captcha")

    def validate(self, value):
        custom_errors = defaultdict(list)
        captcha_token = value.get("captcha")
        self.fields.pop("re_password", None)
        re_password = value.pop("re_password")
        email = value.get("email").lower()
        password = value.get("password")
        company_data = value.get("company")
        is_registered = company_data.get("is_registered")
        is_startup = company_data.get("is_startup")
        if User.objects.filter(email=email).exists():
            custom_errors["email"].append("Email is already registered")
        else:
            value["email"] = email
        if not is_registered and not is_startup:
            custom_errors["comp_status"].append(
                "Please choose who you represent."
            )
        try:
            validate_password_long(password)
        except ValidationError as error:
            custom_errors["password"].append(error.message)
        try:
            validate_password_include_symbols(password)
        except ValidationError as error:
            custom_errors["password"].append(error.message)
        if value["password"] != re_password:
            custom_errors["password"].append("Passwords don't match.")
        if captcha_token and not verify_recaptcha(captcha_token):
            custom_errors["captcha"].append(
                "Invalid reCAPTCHA. Please try again."
            )
        if custom_errors:
            raise serializers.ValidationError(custom_errors)
        return value

    def create(self, validated_data):
        validated_data.pop("captcha", None)
        company_data = validated_data.pop("company")
        user = User.objects.create(**validated_data)
        user.set_password(validated_data["password"])
        user.save()
        Profile.objects.create(**company_data, person=user)
        return user


class UserListSerializer(UserSerializer):
    profile_id = serializers.PrimaryKeyRelatedField(
        source="profile", read_only=True
    )

    class Meta(UserSerializer.Meta):
        model = User
        fields = (
            "id",
            "email",
            "name",
            "surname",
            "profile_id",
            "is_staff",
            "is_superuser",
        )


class CustomTokenCreateSerializer(TokenCreateSerializer):
    captcha = serializers.CharField(
        write_only=True, allow_blank=True, allow_null=True
    )

    @RateLimit(
        calls=django_settings.ATTEMPTS_FOR_LOGIN,
        period=django_settings.DELAY_FOR_LOGIN,
    )
    def validate(self, attrs):
        captcha_token = attrs.get("captcha")
        email = attrs.get(djoser_settings.LOGIN_FIELD).lower()
        new_attr = {
            "password": attrs.get("password"),
            "email": email
        }

        try:
            validate_profile(attrs.get("email"))
        except ValidationError as error:
            raise serializers.ValidationError(error.message)

        if captcha_token and not verify_recaptcha(captcha_token):
            raise serializers.ValidationError(
                "Invalid reCAPTCHA. Please try again."
            )

        return super().validate(new_attr)
