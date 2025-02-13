from rest_framework.test import APITestCase
from rest_framework import status
import os

from authentication.factories import UserFactory
from images.factories import ProfileimageFactory
from utils.dump_response import dump  # noqa


class TestDeleteImages(APITestCase):
    def setUp(self) -> None:
        self.banner_path = os.path.join(
            os.getcwd(), "images", "tests", "img", "img_2mb.png"
        )
        self.logo_path = os.path.join(
            os.getcwd(), "images", "tests", "img", "img_300kb.png"
        )

        self.user_is_staff = UserFactory(is_staff=True)
        self.user_is_owner = UserFactory()
        self.user = UserFactory()
        self.banner = ProfileimageFactory(
            image_path=self.banner_path, created_by=self.user_is_owner
        )
        self.logo = ProfileimageFactory(
            image_path=self.logo_path, created_by=self.user_is_owner
        )

    def test_delete_banner_authorized_user_is_staff(self):
        self.client.force_authenticate(self.user_is_staff)
        response = self.client.delete(
            path=f"/api/image/banner/{self.banner.uuid}",
        )
        self.banner.refresh_from_db()
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
        self.assertTrue(self.banner.is_deleted)

    def test_delete_logo_authorized_user_is_staff(self):
        self.client.force_authenticate(self.user_is_staff)
        response = self.client.delete(
            path=f"/api/image/logo/{self.logo.uuid}",
        )
        self.logo.refresh_from_db()
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
        self.assertTrue(self.logo.is_deleted)

    def test_delete_banner_authorized_user_is_owner(self):
        self.client.force_authenticate(self.user_is_owner)
        response = self.client.delete(
            path=f"/api/image/banner/{self.banner.uuid}",
        )
        self.banner.refresh_from_db()
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
        self.assertTrue(self.banner.is_deleted)

    def test_delete_logo_authorized_user_is_owner(self):
        self.client.force_authenticate(self.user_is_owner)
        response = self.client.delete(
            path=f"/api/image/logo/{self.logo.uuid}",
        )
        self.logo.refresh_from_db()
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
        self.assertTrue(self.logo.is_deleted)

    def test_delete_banner_authorized_user_is_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            path=f"/api/image/banner/{self.banner.uuid}",
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_delete_logo_authorized_user_is_not_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            path=f"/api/image/logo/{self.logo.uuid}",
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_delete_banner_unauthorized(self):
        response = self.client.delete(
            path=f"/api/image/banner/{self.banner.uuid}",
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_delete_logo_unauthorized(self):
        response = self.client.delete(
            path=f"/api/image/logo/{self.logo.uuid}",
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)
