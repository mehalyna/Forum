from rest_framework.test import APITestCase
from rest_framework import status
import os
from unittest.mock import patch
from authentication.factories import UserFactory
from utils.dump_response import dump  # noqa
from utils.unittest_helper import AnyInt, AnyStr, AnyUUID


class TestBannerChange(APITestCase):
    def setUp(self) -> None:
        self.right_banner = open(
            os.path.join(os.getcwd(), "images/tests/img/img_2mb.png"),
            "rb",
        )
        self.wrong_size_banner = open(
            os.path.join(os.getcwd(), "images/tests/img/img_7mb.png"),
            "rb",
        )
        self.wrong_format_banner = open(
            os.path.join(
                os.getcwd(),
                "images/tests/img/img_wrong_format_banner.gif",
            ),
            "rb",
        )
        self.right_logo = open(
            os.path.join(os.getcwd(), "images/tests/img/img_300kb.png"),
            "rb",
        )
        self.wrong_size_logo = open(
            os.path.join(os.getcwd(), "images/tests/img/img_7mb.png"),
            "rb",
        )
        self.wrong_format_logo = open(
            os.path.join(
                os.getcwd(),
                "images/tests/img/img_wrong_format_logo.gif",
            ),
            "rb",
        )

        self.user = UserFactory(id=1, email="test1@test.com")

    def tearDown(self) -> None:
        self.right_banner.close()
        self.wrong_size_banner.close()
        self.wrong_format_banner.close()
        self.right_logo.close()
        self.wrong_size_logo.close()
        self.wrong_format_logo.close()

    def test_post_banner_unauthorized(self):
        response = self.client.post(
            path=f"/api/image/banner/",
            data={"image_path": self.right_banner},
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_post_logo_unauthorized(self):
        response = self.client.post(
            path=f"/api/image/logo/",
            data={"image_path": self.right_logo},
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    @patch("django.core.files.storage.FileSystemStorage.save")
    def test_post_valid_banner_authorized(self, mock_save):
        mock_save.return_value = "path/to/mock/image"
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/banner/",
            data={"image_path": self.right_banner},
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(
            {
                "uuid": AnyUUID(),
                "image_type": "banner",
                "image_path": AnyStr(),
                "created_by": 1,
                "content_type": "png",
                "image_size": AnyInt(),
                "hash_md5": AnyStr(),
                "is_approved": False,
                "is_deleted": False,
                "created_at": AnyStr(),
            },
            response.json(),
        )
        mock_save.assert_called_once()

    @patch("django.core.files.storage.FileSystemStorage.save")
    def test_post_valid_logo_authorized(self, mock_save):
        mock_save.return_value = "path/to/mock/image"
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/logo/",
            data={"image_path": self.right_logo},
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(
            {
                "uuid": AnyUUID(),
                "image_type": "logo",
                "image_path": AnyStr(),
                "created_by": 1,
                "content_type": "png",
                "image_size": AnyInt(),
                "hash_md5": AnyStr(),
                "is_approved": False,
                "is_deleted": False,
                "created_at": AnyStr(),
            },
            response.json(),
        )
        mock_save.assert_called_once()

    def test_post_wrong_size_banner_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/banner/",
            data={"image_path": self.wrong_size_banner},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {
                "non_field_errors": [
                    "Image size exceeds the maximum allowed (5MB)."
                ]
            },
            response.json(),
        )

    def test_post_wrong_size_logo_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/logo/",
            data={"image_path": self.wrong_size_logo},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {
                "non_field_errors": [
                    "Image size exceeds the maximum allowed (1MB)."
                ]
            },
            response.json(),
        )

    def test_post_wrong_format_logo_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/logo/",
            data={"image_path": self.wrong_format_logo},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {
                "image_path": [
                    "File extension “gif” is not allowed. Allowed extensions are: "
                    "jpeg, png, jpg."
                ]
            },
            response.json(),
        )

    def test_post_wrong_format_banner_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            path=f"/api/image/logo/",
            data={"image_path": self.wrong_format_banner},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {
                "image_path": [
                    "File extension “gif” is not allowed. Allowed extensions are: "
                    "jpeg, png, jpg."
                ]
            },
            response.json(),
        )
