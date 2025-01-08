from rest_framework.test import APITestCase
from rest_framework import status
from administration.factories import AdminUserFactory, AdminProfileFactory
from utils.unittest_helper import utc_datetime


class TestMonthlyProfileStatisticsStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory()
        self.client.force_authenticate(self.user)
        self.test_startup_user = AdminUserFactory(is_staff=False)
        self.test_investor_user = AdminUserFactory(is_staff=False)
        self.test_blocked_company_user = AdminUserFactory(is_staff=False)
        self.startup_company = AdminProfileFactory(
            person_id=self.test_startup_user.id, is_registered=False
        )
        self.startup_company.created_at = utc_datetime(2023, 12, 7)
        self.startup_company.save()
        self.investor_company = AdminProfileFactory(
            person_id=self.test_investor_user.id, is_startup=False
        )
        self.investor_company.created_at = utc_datetime(2024, 5, 10)
        self.investor_company.save()
        self.blocked_company = AdminProfileFactory(
            person_id=self.test_blocked_company_user.id, status="blocked"
        )
        self.blocked_company.created_at = utc_datetime(2024, 12, 12)
        self.blocked_company.save()

    def test_get_monthly_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/monthly/")
        data = [
            {
                "month": 12,
                "year": 2023,
                "investors_count": 0,
                "startups_count": 1,
                "startup_investor_count": 0,
            },
            {
                "month": 5,
                "year": 2024,
                "investors_count": 1,
                "startups_count": 0,
                "startup_investor_count": 0,
            },
            {
                "month": 12,
                "year": 2024,
                "investors_count": 0,
                "startups_count": 0,
                "startup_investor_count": 1,
            },
        ]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)

    def test_get_monthly_statistics_incorrect_year(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/monthly/?year=2002"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_get_monthly_statistics_correct_year(self):
        response = self.client.get(
            "/api/admin/profiles/statistics/monthly/?year=2024"
        )
        data = [
            {
                "month": 5,
                "year": 2024,
                "investors_count": 1,
                "startups_count": 0,
                "startup_investor_count": 0,
            },
            {
                "month": 12,
                "year": 2024,
                "investors_count": 0,
                "startups_count": 0,
                "startup_investor_count": 1,
            },
        ]
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, data)


class TestMonthlyProfileStatisticsNotStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(is_staff=False)
        self.client.force_authenticate(self.user)

    def test_get_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/monthly/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestMonthlyProfileStatisticsUnauthorized(APITestCase):
    def test_get_profile_statistics(self):
        response = self.client.get("/api/admin/profiles/statistics/monthly/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
