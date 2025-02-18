from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase
from time import sleep

from authentication.factories import UserFactory

from utils.dump_response import dump  # noqa
from utils.unittest_helper import AnyStr


class LoginRateLimitTests(APITestCase):
    def setUp(self):
        self.patcher_recaptcha = patch(
            "authentication.serializers.verify_recaptcha", return_value=True
        )
        self.mock_verify_recaptcha = self.patcher_recaptcha.start()
        self.addCleanup(self.patcher_recaptcha.stop)

        self.user = UserFactory(email="test@example.com")
        self.user.set_password("Test1234")
        self.user.save()

    def setup_redis_mock(self, mock_redis):
        redis_memory = {}
        mock_instance = mock_redis.return_value

        def mock_get(key):
            return str(redis_memory.get(key, 0)).encode()

        def mock_incr(key):
            redis_memory[key] = redis_memory.get(key, 0) + 1
            return redis_memory[key]

        def mock_set(key, value, ex=None):
            redis_memory[key] = value

        def mock_flushall():
            redis_memory.clear()

        mock_instance.get.side_effect = mock_get
        mock_instance.incr.side_effect = mock_incr
        mock_instance.set.side_effect = mock_set
        mock_instance.flushall.side_effect = mock_flushall

        return mock_instance

    @patch("utils.ratelimiters.redis.Redis")
    def test_login_blocked_after_too_many_attempts(self, mock_redis):
        mock_redis_instance = self.setup_redis_mock(mock_redis)

        sleep(
            3
        )  # prevent endpoint is being blocked unexpectedly due to exceeding limit of calls
        for _ in range(2):
            response = self.client.post(
                path="/api/auth/token/login/",
                data={
                    "email": "test@example.com",
                    "password": "wrongpassword",
                    "captcha": "dummy_captcha",
                },
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@example.com",
                "password": "wrongpassword",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(
            response.status_code, status.HTTP_429_TOO_MANY_REQUESTS
        )

        mock_redis_instance.flushall()

    @patch("utils.ratelimiters.redis.Redis")
    def test_login_after_allowed_delay_time(self, mock_redis):
        mock_redis_instance = self.setup_redis_mock(mock_redis)

        sleep(
            3
        )  # prevent endpoint is being blocked unexpectedly due to exceeding limit of calls
        for _ in range(2):
            response = self.client.post(
                path="/api/auth/token/login/",
                data={
                    "email": "test@example.com",
                    "password": "wrongpassword",
                    "captcha": "dummy_captcha",
                },
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@example.com",
                "password": "wrongpassword",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(
            response.status_code, status.HTTP_429_TOO_MANY_REQUESTS
        )

        sleep(4)  # delay time before the next login attempt
        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@example.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({"auth_token": AnyStr()}, response.json())
        self.assertContains(response, "auth_token")

        mock_redis_instance.flushall()
