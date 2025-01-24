from rest_framework import status
from rest_framework.test import APITestCase

from administration.factories import (
    AdminUserFactory,
    AdminProfileFactory,
)

from utils.unittest_helper import AnyInt, AnyStr
from utils.dump_response import dump  # noqa


class TestAdminProfilesAPITestsNotStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(
            is_staff=False,
            is_active=True,
        )
        self.profile = AdminProfileFactory()

    def test_get_profiles_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/profiles/")
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_get_profile_id_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path=f"/api/admin/profiles/{self.profile.id}/"
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)


class TestAdminProfilesAPITests(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory()
        self.profile = AdminProfileFactory(person_id=self.user.id)

    def test_get_profiles_not_authorized(self):
        response = self.client.get(
            path="/api/admin/profiles/?page=1&page_size=1"
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_get_profile_id_not_authorized(self):
        response = self.client.get(
            path=f"/api/admin/profiles/{self.profile.id}/"
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_get_profiles_structure_json(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/profiles/")
        data = [
            {
                "id": AnyInt(),
                "name": "Test person",
                "person": {
                    "name": AnyStr(),
                    "surname": AnyStr(),
                    "email": AnyStr(),
                    "is_active": True,
                    "is_staff": True,
                    "is_superuser": False,
                    "company_name": True,
                },
                "business_entity": AnyStr(),
                "status": AnyStr(),
                "updated_at": AnyStr(),
                "created_at": AnyStr(),
                "company_type": AnyStr(),
                "activities": [],
                "representative": AnyStr(),
                "phone": "380112909099",
                "address": "Test Country, Test City, St. Test, 1",
                "is_deleted": False,
            }
        ]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(data, response.data["results"])

    def test_get_profile_id_authenticated(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path=f"/api/admin/profiles/{self.profile.id}/"
        )
        data = {
            "name": "Test person",
            "is_registered": True,
            "is_startup": True,
            "is_fop": False,
            "categories": [],
            "activities": [],
            "person": {
                "name": AnyStr(),
                "surname": AnyStr(),
                "email": AnyStr(),
                "is_active": True,
                "is_staff": True,
                "is_superuser": False,
                "company_name": True,
            },
            "person_position": "Test person position",
            "official_name": "Test official name",
            "regions": [],
            "regions_ukr_display": "",
            "common_info": "test common info",
            "phone": "380112909099",
            "edrpou": "10000000",
            "rnokpp": None,
            "status": AnyStr(),
            "founded": 2022,
            "service_info": "test service info",
            "product_info": "test product info",
            "address": "Test Country, Test City, St. Test, 1",
            "startup_idea": "Test startup idea",
            "banner": None,
            "logo": None,
            "is_deleted": False,
        }
        self.assertEqual(data, response.json())


class TestDeleteProfile(APITestCase):
    def setUp(self):
        self.profile = AdminProfileFactory()
        self.user = AdminUserFactory()

    def test_delete_Profile(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            path=f"/api/admin/profiles/{self.profile.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_profile_not_authorized(self):
        response = self.client.delete(
            path=f"/api/admin/profiles/{self.profile.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestPutProfile(APITestCase):
    def setUp(self):
        self.profile = AdminProfileFactory()
        self.user = AdminUserFactory()

    def test_put_profile(self):
        self.client.force_authenticate(self.user)
        data = {
            "name": "Test string",
            "is_registered": True,
            "is_startup": True,
            "person_position": "Test string",
            "official_name": "Test string",
            "common_info": "Test string",
            "phone": 123456789012,
            "edrpou": 12345678,
            "founded": 2024,
            "service_info": "Test string",
            "product_info": "Test string",
            "address": "Test string",
            "startup_idea": "Test string",
            "is_deleted": True,
        }
        response = self.client.put(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_reverese_bool_profile(self):
        self.client.force_authenticate(self.user)
        data = {
            "name": "Test string",
            "is_registered": False,
            "is_startup": False,
            "person_position": "Test string",
            "official_name": "Test string",
            "common_info": "Test string",
            "phone": 123456789012,
            "edrpou": 12345678,
            "founded": 2024,
            "service_info": "Test string",
            "product_info": "Test string",
            "address": "Test string",
            "startup_idea": "Test string",
            "is_deleted": False,
        }
        response = self.client.put(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_profile_not_authorized(self):
        data = {"name": "Test string", "is_deleted": True}
        response = self.client.put(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_profile_not_exist(self):
        self.client.force_authenticate(self.user)
        data = {"name": "Test string", "is_deleted": True}
        response = self.client.put(
            path=f"/api/admin/profiles/0/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestPatchProfile(APITestCase):
    def setUp(self):
        self.profile = AdminProfileFactory()
        self.user = AdminUserFactory()

    def test_patch_profile(self):
        self.client.force_authenticate(self.user)
        data = {
            "name": "Test string",
            "is_registered": True,
            "is_startup": True,
            "person_position": "Test string",
            "official_name": "Test string",
            "common_info": "Test string",
            "phone": 123456789012,
            "edrpou": 12345678,
            "founded": 2024,
            "service_info": "Test string",
            "product_info": "Test string",
            "address": "Test string",
            "startup_idea": "Test string",
            "is_deleted": True,
        }
        response = self.client.patch(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_reverese_bool_profile(self):
        self.client.force_authenticate(self.user)
        data = {
            "name": "Test string",
            "is_registered": False,
            "is_startup": False,
            "person_position": "Test string",
            "official_name": "Test string",
            "common_info": "Test string",
            "phone": 123456789012,
            "edrpou": 12345678,
            "founded": 2024,
            "service_info": "Test string",
            "product_info": "Test string",
            "address": "Test string",
            "startup_idea": "Test string",
            "is_deleted": False,
        }
        response = self.client.patch(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_profile_not_authorized(self):
        data = {"name": "Test string", "is_deleted": True}
        response = self.client.patch(
            path=f"/api/admin/profiles/{self.profile.id}/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_profile_not_exist(self):
        self.client.force_authenticate(self.user)
        data = {"name": "Test string", "is_deleted": True}
        response = self.client.patch(
            path=f"/api/admin/profiles/0/",
            data=data,
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestPostProfile(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory()

    def test_create_profile_authorized_full_data(self):
        user2 = AdminUserFactory()
        new_profile_data = {
            "person": user2.id,
            "official_name": "Official name from test case",
            "common_info": "Common info from test case",
            "phone": "123456789012",
            "edrpou": "12345678",
            "founded": 2005,
            "service_info": "Service info from test case",
            "product_info": "Product info from test case",
            "address": "Kyiv",
            "person_position": "director",
            "startup_idea": "StartUp idea from test case",
            "is_startup": True,
            "is_registered": False,
            "name": "Comp name from test case",
        }

        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/admin/profiles/", data=new_profile_data
        )
        self.assertEqual(
            status.HTTP_405_METHOD_NOT_ALLOWED, response.status_code
        )

    def test_create_profile_not_authorized_full_data(self):
        user2 = AdminUserFactory()
        new_profile_data = {
            "person": user2.id,
            "official_name": "Official name from test case",
            "common_info": "Common info from test case",
            "phone": "123456789012",
            "edrpou": "12345678",
            "founded": 2005,
            "service_info": "Service info from test case",
            "product_info": "Product info from test case",
            "address": "Kyiv",
            "person_position": "director",
            "startup_idea": "StartUp idea from test case",
            "is_startup": True,
            "is_registered": False,
            "name": "Comp name from test case",
        }
        response = self.client.post(
            path=f"/api/admin/profiles/", data=new_profile_data
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)
