from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    ProfileCompanyFactory,
)

from profiles.models import Profile
from utils.dump_response import dump  # noqa


class TestProfileManager(TestCase):
    def setUp(self) -> None:
        self.inactive_user = UserFactory(is_active=False)
        self.active_and_visible_profile1 = ProfileCompanyFactory()
        self.active_and_visible_profile2 = ProfileStartupFactory()
        self.active_profile_only_categories = ProfileStartupFactory(
            activities=[]
        )
        self.active_profile_only_activities = ProfileStartupFactory(
            categories=[]
        )
        self.active_profile_without_common_info = ProfileStartupFactory(
            common_info=""
        )
        self.active_profile_without_name = ProfileStartupFactory(name=None)

        self.inactive_profile = ProfileCompanyFactory(
            person=self.inactive_user
        )
        self.deleted_profile = ProfileCompanyFactory(is_deleted=True)

    def test_active_only_profiles(self):
        active_profiles = Profile.objects.active_only()

        self.assertEqual(6, len(active_profiles))
        self.assertNotIn(self.inactive_profile, active_profiles)
        self.assertNotIn(self.deleted_profile, active_profiles)
        for profile in active_profiles:
            self.assertFalse(profile.is_deleted)
            self.assertTrue(profile.person.is_active)

    def test_visible_only_profiles(self):
        visible_profiles = Profile.objects.visible_only()

        self.assertEqual(2, len(visible_profiles))
        for profile in visible_profiles:
            self.assertFalse(profile.is_deleted)
            self.assertTrue(profile.person.is_active)
            self.assertIsNotNone(profile.common_info)
            self.assertIsNotNone(profile.name)
            self.assertTrue(profile.categories.exists())
            self.assertTrue(profile.activities.exists())


class TestProfileVisibleOnlyAPIView(APITestCase):
    def setUp(self) -> None:
        self.inactive_user = UserFactory(is_active=False)
        self.visible_profile1 = ProfileCompanyFactory()
        self.visible_profile2 = ProfileStartupFactory()
        self.profile_only_categories = ProfileStartupFactory(activities=[])
        self.inactive_profile = ProfileCompanyFactory(
            person=self.inactive_user
        )

    def test_get_visible_only_profiles(self):
        response = self.client.get(path="/api/profiles/")
        visible_profiles = Profile.objects.visible_only()
        expected_response = [
            {
                "id": self.visible_profile1.id,
                "name": self.visible_profile1.name,
                "person": self.visible_profile1.person_id,
                "is_registered": self.visible_profile1.is_registered,
                "is_startup": self.visible_profile1.is_startup,
                "official_name": self.visible_profile1.official_name,
                "regions": [],
                "regions_ukr_display": "",
                "common_info": self.visible_profile1.common_info,
                "address": self.visible_profile1.address,
                "founded": self.visible_profile1.founded,
                "categories": list(
                    self.visible_profile1.categories.values("id", "name")
                ),
                "activities": list(
                    self.visible_profile1.activities.values("id", "name")
                ),
                "banner": None,
                "logo": None,
                "is_saved": False,
                "saved_is_updated": False,
            },
            {
                "id": self.visible_profile2.id,
                "name": self.visible_profile2.name,
                "person": self.visible_profile2.person_id,
                "is_registered": self.visible_profile2.is_registered,
                "is_startup": self.visible_profile2.is_startup,
                "official_name": self.visible_profile2.official_name,
                "regions": [],
                "regions_ukr_display": "",
                "common_info": self.visible_profile2.common_info,
                "address": self.visible_profile2.address,
                "founded": self.visible_profile2.founded,
                "categories": list(
                    self.visible_profile2.categories.values("id", "name")
                ),
                "activities": list(
                    self.visible_profile2.activities.values("id", "name")
                ),
                "banner": None,
                "logo": None,
                "is_saved": False,
                "saved_is_updated": False,
            },
        ]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(len(visible_profiles), response.data["total_items"])
        self.assertListEqual(expected_response, response.data["results"])
