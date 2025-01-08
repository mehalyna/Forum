from rest_framework.test import APITestCase
from administration.factories import AdminUserFactory, AdminProfileFactory
from rest_framework import status
from profiles.models import Activity


class ProfileStatisticsActivitiesTest(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory()
        self.activities = {
            "Виробник": Activity.objects.create(name="Виробник"),
            "Імпортер": Activity.objects.create(name="Імпортер"),
            "Роздрібна мережа": Activity.objects.create(
                name="Роздрібна мережа"
            ),
            "Інші послуги": Activity.objects.create(name="Інші послуги"),
        }
        self.profiles = []
        profile1 = AdminProfileFactory()
        profile1.activities.set([self.activities["Виробник"]])
        self.profiles.append(profile1)

        profile2 = AdminProfileFactory()
        profile2.activities.set([self.activities["Імпортер"]])
        self.profiles.append(profile2)

        profile3 = AdminProfileFactory()
        profile3.activities.set([self.activities["Роздрібна мережа"]])
        self.profiles.append(profile3)

        profile4 = AdminProfileFactory()
        profile4.activities.set([self.activities["Інші послуги"]])
        self.profiles.append(profile4)

        profile5 = AdminProfileFactory()
        profile5.activities.set([self.activities["Виробник"]])
        self.profiles.append(profile5)
        self.url = "/api/admin/profiles/statistics-activities/"

    def test_statistics_view_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_statistics_view_with_valid_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        data = {
            "manufacturers_count": 2,
            "importers_count": 1,
            "retail_networks_count": 1,
            "others_count": 1,
        }
        self.assertEqual(response.json(), data)
