from unittest.mock import patch, call

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileCompanyFactory,
)
from images.factories import ProfileimageFactory
from utils.moderation.encode_decode_id import encode_id
from utils.unittest_helper import AnyStr
from utils.dump_response import dump  # noqa


@patch("profiles.views.ModerationManager.schedule_autoapprove")
@patch("profiles.views.ModerationManager.revoke_deprecated_autoapprove")
class TestProfileModeration(APITestCase):
    def setUp(self) -> None:
        self.banner = ProfileimageFactory(image_type="banner")
        self.logo = ProfileimageFactory(image_type="logo")
        self.second_banner = ProfileimageFactory(image_type="banner")
        self.second_logo = ProfileimageFactory(image_type="logo")
        self.user = UserFactory(email="test@test.com")
        self.profile = ProfileCompanyFactory.create(person=self.user)

        self.user_client = APIClient()
        self.user_client.force_authenticate(self.user)

        self.moderator_client = APIClient()

    def test_unblock_banner_and_logo(self, mock_revoke, mock_schedule):
        # user updates both banner and logo
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
            },
        )
        self.profile.refresh_from_db()

        # moderator rejects request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "reject",
            },
        )

        # moderator unlocks request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "unblock",
            },
        )

        self.profile.refresh_from_db()
        self.user.refresh_from_db()
        self.banner.refresh_from_db()
        self.logo.refresh_from_db()

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            {"status_updated_at": AnyStr(), "status": "undefined"},
            response.json(),
        )
        self.assertTrue(self.banner.is_deleted)
        self.assertTrue(self.logo.is_deleted)
        self.assertIsNone(self.profile.banner)
        self.assertIsNone(self.profile.logo)
        self.assertEqual(self.profile.UNDEFINED, self.profile.status)
        mock_schedule.assert_has_calls([call()])
        mock_revoke.assert_has_calls([call(), call()])

    def test_unblock_banner(self, mock_revoke, mock_schedule):
        # user updates only banner
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "banner": self.banner.uuid,
            },
        )
        self.profile.refresh_from_db()

        # moderator rejects request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "action": "reject",
            },
        )

        # moderator unlock request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "action": "unblock",
            },
        )

        self.profile.refresh_from_db()
        self.user.refresh_from_db()
        self.banner.refresh_from_db()

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            {"status_updated_at": AnyStr(), "status": "undefined"},
            response.json(),
        )
        self.assertTrue(self.banner.is_deleted)
        self.assertEqual(self.profile.UNDEFINED, self.profile.status)
        self.assertFalse(self.profile.is_deleted)
        self.assertTrue(self.user.is_active)
        mock_schedule.assert_has_calls([call()])
        mock_revoke.assert_has_calls([call(), call()])

    def test_unblock_logo(self, mock_revoke, mock_schedule):
        # user updates only logo
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "logo": self.logo.uuid,
            },
        )
        self.profile.refresh_from_db()

        # moderator rejects request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "logo": self.profile.logo.uuid,
                "action": "reject",
            },
        )

        # moderator unlock request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "logo": self.profile.logo.uuid,
                "action": "unblock",
            },
        )

        self.profile.refresh_from_db()
        self.user.refresh_from_db()
        self.logo.refresh_from_db()

        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            {"status_updated_at": AnyStr(), "status": "undefined"},
            response.json(),
        )
        self.assertTrue(self.logo.is_deleted)
        self.assertEqual(self.profile.UNDEFINED, self.profile.status)
        self.assertFalse(self.profile.is_deleted)
        self.assertTrue(self.user.is_active)
        mock_schedule.assert_has_calls([call()])
        mock_revoke.assert_has_calls([call(), call()])

    def test_not_blocked_profile(self, mock_revoke, mock_schedule):
        # user updates both banner and logo
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
            },
        )
        self.profile.refresh_from_db()

        # moderator approves request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "approve",
            },
        )

        # moderator unlocks request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "unblock",
            },
        )

        self.profile.refresh_from_db()
        self.banner.refresh_from_db()
        self.logo.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            {"non_field_errors": ["The profile is not blocked"]},
            response.json(),
        )
        self.assertEqual(self.profile.APPROVED, self.profile.status)
        mock_schedule.assert_called_once()
        mock_revoke.assert_called_once()

    def test_login_unblocked_user(self, mock_revoke, mock_schedule):
        # user updates both banner and logo
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
            },
        )
        self.profile.refresh_from_db()

        # moderator rejects request
        self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "reject",
            },
        )

        # moderator unlocks request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "banner": self.profile.banner.uuid,
                "logo": self.profile.logo.uuid,
                "action": "unblock",
            },
        )

        self.user.refresh_from_db()
        self.user.set_password("Test1234")
        self.user.save()

        # user with unblocked profile tries to log in
        response = self.user_client.post(
            path="/api/auth/token/login/",
            data={
                "email": "test@test.com",
                "password": "Test1234",
                "captcha": "dummy_captcha",
            },
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual({"auth_token": AnyStr()}, response.json())
        self.assertContains(response, "auth_token")
        mock_schedule.assert_has_calls([call()])
        mock_revoke.assert_has_calls([call(), call()])

    def test_unblock_banner_and_logo_empty_image_fields(
        self, mock_revoke, mock_schedule
    ):
        # user updates both banner and logo
        self.user_client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
            },
        )

        # moderator rejects request
        response = self.moderator_client.patch(
            path="/api/profiles/{profile_id}/images_moderation/".format(
                profile_id=encode_id(self.profile.id)
            ),
            data={
                "action": "unblock",
            },
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {
                "non_field_errors": [
                    "At least one image (logo or banner) must be provided for the moderation request."
                ]
            },
            response.json(),
        )
        mock_schedule.assert_called_once()
        mock_revoke.assert_not_called()
