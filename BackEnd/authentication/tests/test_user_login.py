from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase
from time import sleep

from authentication.factories import UserFactory
from utils.dump_response import dump  # noqa
from utils.unittest_helper import AnyStr


class UserLoginAPITests(APITestCase):
    def setUp(self):
        patcher = patch(
            "authentication.serializers.verify_recaptcha", return_value=True
        )
        self.mock_verify_recaptcha = patcher.start()
        self.addCleanup(patcher.stop)

        patcher_ratelimit = patch("utils.ratelimiters.RateLimit", autospec=True)
        self.mock_ratelimit = patcher_ratelimit.start()
        self.addCleanup(patcher_ratelimit.stop)

        self.user = UserFactory(email="test@test.com")

    def test_login_successful(self):
        self.user.set_password("Test1234")
        self.user.save()
        sleep(6)
        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({"auth_token": AnyStr()}, response.json())
        self.assertContains(response, "auth_token")

    def test_login_email_incorrect(self):
        self.user.set_password("Test1234")
        self.user.save()

        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "tost@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            {
                "non_field_errors": [
                    "Unable to log in with provided credentials."
                ]
            },
            response.json(),
        )

    def test_login_password_incorrect(self):
        self.user.set_password("Test1234")
        self.user.save()

        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test5678",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            {
                "non_field_errors": [
                    "Unable to log in with provided credentials."
                ]
            },
            response.json(),
        )

    def test_login_after_allowed_delay_time(self):
        self.user.set_password("Test1234")
        self.user.save()

        self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )

        self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        sleep(6)
        response = self.client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({"auth_token": AnyStr()}, response.json())
        self.assertContains(response, "auth_token")

    def tearDown(self):
        """Очищуємо Redis після кожного тесту."""
        with patch("utils.ratelimiters.redis.Redis") as mock_redis:
            mock_instance = mock_redis.return_value
            mock_instance.flushall()
            mock_instance.delete(f"rate_limit:{self.user.email}")


class TestLoginRateLimit(APITestCase):
    def setUp(self):
        self.patcher_recaptcha = patch(
            "authentication.serializers.verify_recaptcha", return_value=True
        )
        self.mock_verify_recaptcha = self.patcher_recaptcha.start()
        self.addCleanup(self.patcher_recaptcha.stop)

        self.user = UserFactory(email="test@example.com")
        self.login_url = "/api/auth/token/login/"
        self.valid_data = {
            "email": self.user.email,
            "password": "wrongpassword",
            "captcha": "dummy_captcha",
        }

    @patch("utils.ratelimiters.redis.Redis")
    def test_login_blocked_after_too_many_attempts(self, mock_redis):
        """
        Перевіряємо, що після перевищення ліміту повертається 429 Too Many Requests
        """
        redis_memory = {}

        def mock_get(key):
            return str(redis_memory.get(key, 0)).encode()

        def mock_incr(key):
            redis_memory[key] = redis_memory.get(key, 0) + 1
            return redis_memory[key]

        def mock_flushall():
            redis_memory.clear()

        mock_instance = mock_redis.return_value
        mock_instance.get.side_effect = mock_get
        mock_instance.incr.side_effect = mock_incr
        mock_instance.flushall.side_effect = mock_flushall

        for _ in range(2):
            response = self.client.post(self.login_url, self.valid_data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(self.login_url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        mock_instance.flushall()

    def tearDown(self):
        with patch("utils.ratelimiters.redis.Redis") as mock_redis:
            mock_instance = mock_redis.return_value
            mock_instance.flushall()


# from unittest.mock import patch
# from rest_framework import status
# from rest_framework.test import APITestCase
# from authentication.factories import UserFactory
# from utils.ratelimiters import RateLimit


# class TestLoginRateLimit(APITestCase):
#     def setUp(self):
#         self.redis_memory = {}

#         # Мокаємо reCAPTCHA
#         patcher_recaptcha = patch(
#             "authentication.serializers.verify_recaptcha", return_value=True
#         )
#         self.mock_verify_recaptcha = patcher_recaptcha.start()
#         self.addCleanup(patcher_recaptcha.stop)

#         redis_patcher = patch("utils.ratelimiters.redis.Redis")
#         self.mock_redis = redis_patcher.start()
#         self.addCleanup(redis_patcher.stop)

#         mock_instance = self.mock_redis.return_value
#         mock_instance.get.side_effect = lambda key: str(self.redis_memory.get(key, 0)).encode()
#         mock_instance.incr.side_effect = lambda key: self.redis_memory.update({key: self.redis_memory.get(key, 0) + 1}) or self.redis_memory[key]
#         mock_instance.flushall.side_effect = lambda: self.redis_memory.clear()
#         mock_instance.delete.side_effect = lambda key: self.redis_memory.pop(key, None)

#         self.redis_memory.clear()

#         rate_limit_patcher = patch("utils.ratelimiters.RateLimit.__call__", lambda self, f: f)
#         self.mock_rate_limit = rate_limit_patcher.start()
#         self.addCleanup(rate_limit_patcher.stop)

#         self.user = UserFactory(email="test@example.com")
#         self.login_url = "/api/auth/token/login/"
#         self.valid_data = {
#             "email": self.user.email,
#             "password": "wrongpassword",
#             "captcha": "dummy_captcha",
#         }

#     @patch("utils.ratelimiters.redis.Redis")  # Мокаємо підключення до Redis
#     def test_login_blocked_after_too_many_attempts(self, mock_redis):
#         self.redis_memory.clear()  # Очищаємо RateLimit перед тестом

#         mock_instance = mock_redis.return_value
#         mock_instance.flushall()

#         for _ in range(2):
#             response = self.client.post(self.login_url, self.valid_data)
#             self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#         response = self.client.post(self.login_url, self.valid_data)
#         self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)