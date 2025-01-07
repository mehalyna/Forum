from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import timedelta

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    ProfileCompanyFactory,
)

from profiles.factories import SavedCompanyFactory, SavedStartupFactory
from utils.unittest_helper import utc_datetime
from utils.dump_response import dump  # noqa


class TestProfileOrdering(APITestCase):
    def setUp(self) -> None:
        self.user = UserFactory()

        self.startup_brewery = ProfileStartupFactory(
            name="Brewery", completeness=110
        )
        self.startup_brewery.created_at = utc_datetime(2023, 11, 1)
        self.startup_brewery.save()

        self.startup_catering = ProfileStartupFactory(
            name="Catering service", completeness=5
        )
        self.startup_catering.created_at = utc_datetime(2023, 11, 15)
        self.startup_catering.save()

        self.company_winery = ProfileCompanyFactory(
            name="Winery", completeness=1
        )
        self.company_winery.created_at = utc_datetime(2023, 12, 5)
        self.company_winery.save()

        self.company_retail = ProfileCompanyFactory(
            name="Retail company", completeness=105
        )
        self.company_retail.created_at = utc_datetime(2023, 12, 7)
        self.company_retail.save()

        self.startup_bakery = ProfileStartupFactory(
            name="Bakery", completeness=1
        )
        self.startup_bakery.created_at = utc_datetime(2023, 12, 31)
        self.startup_bakery.save()

        self.company_delivery = ProfileCompanyFactory(
            name="Delivery company", completeness=2
        )
        self.company_delivery.created_at = utc_datetime(2024, 1, 15)
        self.company_delivery.save()

        self.saved_company_first = SavedCompanyFactory(
            user=self.user,
            company=self.company_delivery,
        )
        self.saved_company_first.added_at = timezone.now() - timedelta(days=3)
        self.saved_company_first.save()

        self.saved_company_second = SavedCompanyFactory(
            user=self.user, company=self.company_winery
        )
        self.saved_company_second.added_at = timezone.now() - timedelta(days=2)
        self.saved_company_second.save()

        self.saved_startup_third = SavedStartupFactory(
            user=self.user, company=self.startup_bakery
        )
        self.saved_startup_third.added_at = timezone.now() - timedelta(days=1)
        self.saved_startup_third.save()

        self.saved_startup_fourth = SavedStartupFactory(
            user=self.user, company=self.startup_catering
        )
        self.saved_startup_fourth.added_at = timezone.now()
        self.saved_startup_fourth.save()

    def test_get_list_of_profiles_alphabetical_order_asc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=name&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Bakery",
                "Brewery",
                "Catering service",
                "Delivery company",
                "Retail company",
                "Winery",
            ],
            profiles,
        )

    def test_get_list_of_profiles_alphabetical_order_desc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=-name&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Winery",
                "Retail company",
                "Delivery company",
                "Catering service",
                "Brewery",
                "Bakery",
            ],
            profiles,
        )

    def test_get_list_of_profiles_created_at_order_asc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=created_at&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Brewery",
                "Catering service",
                "Winery",
                "Retail company",
                "Bakery",
                "Delivery company",
            ],
            profiles,
        )

    def test_get_list_of_profiles_created_at_order_desc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=-created_at&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Delivery company",
                "Bakery",
                "Retail company",
                "Winery",
                "Catering service",
                "Brewery",
            ],
            profiles,
        )

    def test_get_list_of_profiles_completeness_order_asc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=completeness&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Winery",
                "Bakery",
                "Delivery company",
                "Catering service",
                "Retail company",
                "Brewery",
            ],
            profiles,
        )

    def test_get_list_of_profiles_completeness_order_desc(self):
        response = self.client.get(
            path="/api/profiles/?ordering=-completeness&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            [
                "Brewery",
                "Retail company",
                "Catering service",
                "Delivery company",
                "Winery",
                "Bakery",
            ],
            profiles,
        )

    def test_get_list_of_saved_profiles_added_at_order_asc_auth(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/profiles/?is_saved=True&ordering=saved_at&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            ["Delivery company", "Winery", "Bakery", "Catering service"],
            profiles,
        )

    def test_get_list_of_saved_profiles_added_at_order_desc_auth(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/profiles/?is_saved=True&ordering=-saved_at&page=1&page_size=12"
        )
        profiles = [profile["name"] for profile in response.data["results"]]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            ["Catering service", "Bakery", "Winery", "Delivery company"],
            profiles,
        )
