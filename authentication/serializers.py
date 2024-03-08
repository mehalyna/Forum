from collections import defaultdict

from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from djoser.conf import settings
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer,
    TokenCreateSerializer,
)
from rest_framework import serializers
from ratelimit.decorators import RateLimitDecorator
from ratelimit.exception import RateLimitException
from collections import OrderedDict


from profiles.models import Profile
from validation.validate_password import (
    validate_password_long,
    validate_password_include_symbols,
)
from forum.settings import ATTEMPTS_FOR_LOGIN, DELAY_FOR_LOGIN

User = get_user_model()

# CALLS = ATTEMPTS_FOR_LOGIN
# DELAY = DELAY_FOR_LOGIN


class CustomProfileSerializer(serializers.ModelSerializer):
    is_registered = serializers.BooleanField()
    is_startup = serializers.BooleanField()

    class Meta:
        model = Profile
        fields = ("name", "is_registered", "is_startup")


class UserRegistrationSerializer(UserCreatePasswordRetypeSerializer):
    company = CustomProfileSerializer(write_only=True)
    email = serializers.EmailField(
        write_only=True,
    )
    password = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ("email", "password", "name", "surname", "company")

    def validate(self, value):
        custom_errors = defaultdict(list)
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
        if custom_errors:
            raise serializers.ValidationError(custom_errors)
        return value

    def create(self, validated_data):
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
        fields = ("id", "email", "name", "surname", "profile_id")


class CustomTokenCreateSerializer(TokenCreateSerializer):
    def validate(self, attrs):
        try:
            return self.validate_for_rate(attrs)
        except RateLimitException:
            self.fail("inactive_account")

    @RateLimitDecorator(calls=ATTEMPTS_FOR_LOGIN, period=DELAY_FOR_LOGIN)
    def validate_for_rate(self, attrs):
        email = attrs.get(settings.LOGIN_FIELD).lower()
        new_attr = OrderedDict(
            [("password", attrs.get("password")), ("email", email)]
        )
        return super().validate(new_attr)
