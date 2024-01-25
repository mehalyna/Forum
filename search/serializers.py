from rest_framework import serializers

from profiles.models import Profile, Category, SavedCompany
from profiles.serializers import CategorySerializer


class CompanySerializers(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "categories",
            "region",
            "founded",
            "address",
            "banner_image",
            "logo_image",
            "person",
        )
