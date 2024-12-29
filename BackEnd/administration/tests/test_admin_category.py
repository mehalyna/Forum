from rest_framework import status
from rest_framework.test import APITestCase

from administration.factories import (
    AdminCategoryFactory,
    AdminUserFactory,
)

from utils.dump_response import dump  # noqa
from utils.unittest_helper import AnyInt, AnyStr


class TestAdminCategoryAPIUserNotStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(
            is_staff=False,
            is_active=True,
        )
        self.category = AdminCategoryFactory()

    def test_get_category_users_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/categories/")
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_get_category_id_users_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/categories/1/")
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)


class TestAdminCategoryAPIUserStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(
            is_staff=True,
            is_active=True,
        )
        self.categories = AdminCategoryFactory.create_batch(2)

    def test_get_categories_users_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/categories/")
        data = [
            {
                "id": AnyInt(),
                "name": AnyStr(),
            },
            {
                "id": AnyInt(),
                "name": AnyStr(),
            },
        ]
        self.assertEqual(data, response.json()["results"])
        self.assertEqual(status.HTTP_200_OK, response.status_code)

    def test_get_categories_id_users_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/admin/categories/3/")
        data = {"name": AnyStr()}
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(data, response.json())

    def test_post_new_categories_users_staff(self):
        self.client.force_authenticate(self.user)
        data = {"name": "some category"}
        response = self.client.post(path="/api/admin/categories/", data=data)
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])
        self.assertIn("id", response.json())

    def test_post_unique_categories_users_staff(self):
        self.existing_name = AdminCategoryFactory.create(
            name="existing category"
        )
        self.client.force_authenticate(self.user)
        data = {"name": "existing category"}
        message = "Category with this name already exists."
        response = self.client.post(path="/api/admin/categories/", data=data)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(response.json()["name"][0], message)

    def test_put_categories_id_users_staff(self):
        self.category = AdminCategoryFactory.create()
        self.client.force_authenticate(self.user)
        data = {"name": "category 1212"}
        response = self.client.put(
            path=f"/api/admin/categories/{self.category.id}/", data=data
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])

    def test_patch_categories_id_users_staff(self):
        self.category = AdminCategoryFactory.create()
        self.client.force_authenticate(self.user)
        data = {"name": "category 77"}
        response = self.client.patch(
            path=f"/api/admin/categories/{self.category.id}/", data=data
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])
