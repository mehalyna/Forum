from rest_framework.test import APITestCase
from rest_framework import status
from administration.factories import AdminUserFactory
from authentication.factories import UserFactory
from profiles.factories import (
    ProfileFactory,
    ActivityFactory,
    ProfileCompanyFactory,
    ProfileStartupFactory,
)
from utils.unittest_helper import utc_datetime


class TestProfileStatisticsStaff(APITestCase):
    def setUp(self):
        self.user = UserFactory(is_staff=True)
        self.client.force_authenticate(self.user)

        self.activities = {
            "Виробник": ActivityFactory(name="Виробник"),
            "Імпортер": ActivityFactory(name="Імпортер"),
            "Роздрібна мережа": ActivityFactory(name="Роздрібна мережа"),
            "HORECA": ActivityFactory(name="HORECA"),
            "Інші послуги": ActivityFactory(name="Інші послуги"),
        }

        self.test_startup_user = UserFactory()
        self.test_investor_user = UserFactory()
        self.test_blocked_company_user = UserFactory()
        self.startup_company = ProfileStartupFactory(
            person_id=self.test_startup_user.id,
            activities=[
                self.activities["Виробник"],
                self.activities["HORECA"],
            ],
        )
        self.startup_company.created_at = utc_datetime(2023, 12, 7)

        self.startup_company.save()
        self.investor_company = ProfileCompanyFactory(
            person_id=self.test_investor_user.id,
            activities=[
                self.activities["Імпортер"],
                self.activities["HORECA"],
            ],
        )
        self.investor_company.created_at = utc_datetime(2024, 5, 10)

        self.investor_company.save()
        self.blocked_company = ProfileFactory(
            is_registered=True,
            is_startup=True,
            person_id=self.test_blocked_company_user.id,
            status="blocked",
            activities=[self.activities["Роздрібна мережа"]],
        )
        self.blocked_company.created_at = utc_datetime(2024, 12, 12)
        self.blocked_company.save()

    def test_get_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/")
        data = {
            "companies_count": 3,
            "investors_count": 2,
            "startups_count": 2,
            "blocked_companies_count": 1,
            "manufacturers_count": 1,
            "importers_count": 1,
            "retail_networks_count": 1,
            "horeca_count": 2,
            "others_count": 0,
        }
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_year(self):
        response = self.client.get("/api/admin/profiles/statistics/?year=2024")
        data = {
            "companies_count": 2,
            "investors_count": 2,
            "startups_count": 1,
            "blocked_companies_count": 1,
            "manufacturers_count": 0,
            "importers_count": 1,
            "retail_networks_count": 1,
            "horeca_count": 1,
            "others_count": 0,
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_range(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?start_date=2024-04-08&end_date=2024-12-20"
        )
        data = {
            "companies_count": 2,
            "investors_count": 2,
            "startups_count": 1,
            "blocked_companies_count": 1,
            "manufacturers_count": 0,
            "importers_count": 1,
            "retail_networks_count": 1,
            "horeca_count": 1,
            "others_count": 0,
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_month(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?month=2023-12"
        )
        data = {
            "companies_count": 1,
            "investors_count": 0,
            "startups_count": 1,
            "blocked_companies_count": 0,
            "manufacturers_count": 1,
            "importers_count": 0,
            "retail_networks_count": 0,
            "horeca_count": 1,
            "others_count": 0,
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_day(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?day=2023-12-07"
        )
        data = {
            "companies_count": 1,
            "investors_count": 0,
            "startups_count": 1,
            "blocked_companies_count": 0,
            "manufacturers_count": 1,
            "importers_count": 0,
            "retail_networks_count": 0,
            "horeca_count": 1,
            "others_count": 0,
        }
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_incorrect_day(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?day=2023-13-77"
        )
        data = {"day": ["Enter a valid date."]}
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_incorrect_month(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?month=2023-13-07"
        )
        data = {"month": ["Enter a valid month. Use YYYY-MM"]}
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_incorrect_month_format(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?month=2023-12-07"
        )
        data = {"month": ["Enter a valid month. Use YYYY-MM"]}
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_incorrect_year_format(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?year=2023-1"
        )
        data = {"year": ["Enter a number."]}
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, data)

    def test_get_profile_statistics_filtered_by_incorrect_year(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/?year=-2024"
        )
        data = {"year": ["Enter a valid year. Use YYYY"]}
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, data)


class TestProfileStatisticsNotStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(is_staff=False)
        self.client.force_authenticate(self.user)

    def test_get_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestProfileStatisticsUnauthorized(APITestCase):
    def test_get_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
