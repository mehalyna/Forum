from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from authentication.factories import UserFactory
from utils.dump_response import dump  # noqa
from time import sleep


class UserLogoutAPITests(APITestCase):
    def setUp(self):
        patcher = patch(
            "authentication.serializers.verify_recaptcha", return_value=True
        )
        self.mock_verify_recaptcha = patcher.start()
        self.addCleanup(patcher.stop)

        self.user = UserFactory(email="test@test.com")

        sleep(
            3
        )  # prevent endpoint is being blocked due to exceeding limit of calls

    def test_logout_successful(self):
        self.user.set_password("Test1234")
        self.user.save()

        self.test_user_token = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        ).data["auth_token"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {self.test_user_token}"
        )
        response = self.client.post(path="/api/auth/token/logout/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_not_logged_in(self):
        response = self.client.post(path="/api/auth/token/logout/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            {"detail": "Authentication credentials were not provided."},
            response.json(),
        )
