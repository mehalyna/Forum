import os

from unittest import mock
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    CategoryFactory,
    ActivityFactory,
    RegionFactory,
)
from images.factories import ProfileimageFactory
from utils.dump_response import dump  # noqa
from utils.unittest_helper import AnyInt


class TestProfileDetailAPIView(APITestCase):
    def setUp(self) -> None:
        self.banner_path = os.path.join(
            os.getcwd(), "images/tests/img/img_2mb.png"
        )
        self.logo_path = os.path.join(
            os.getcwd(), "images/tests/img/img_300kb.png"
        )

        self.banner = ProfileimageFactory(image_path=self.banner_path)
        self.logo = ProfileimageFactory(image_path=self.logo_path)
        self.user = UserFactory(email="test1@test.com")
        self.profile = ProfileStartupFactory.create(
            person=self.user,
            official_name="Test Official Startup",
            phone="380100102034",
            edrpou="99999999",
        )

    # GET requests section
    def test_get_profile_nonexistent(self):
        response = self.client.get(
            path="/api/profiles/{profile_id}".format(profile_id=0)
        )
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_get_profile_unauthorized(self):
        response = self.client.get(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            )
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNone(response.data.get("phone"))
        self.assertIsNone(response.data.get("email"))

        # fields check
        self.assertEqual(
            self.profile.official_name,
            response.data.get("official_name"),
            msg="Official names do not match.",
        )

        self.assertFalse(
            response.data.get("regions"),
            msg="Regions do not match.",
        )
        self.assertEqual(
            self.profile.common_info,
            response.data.get("common_info"),
            msg="Common info do not match.",
        )
        self.assertEqual(
            self.profile.edrpou,
            response.data.get("edrpou"),
            msg="EDRPOUs do not match.",
        )
        self.assertEqual(
            self.profile.founded,
            response.data.get("founded"),
            msg="Years of foundation do not match.",
        )
        self.assertEqual(
            self.profile.address,
            response.data.get("address"),
            msg="Addresses do not match.",
        )
        self.assertEqual(
            self.profile.startup_idea,
            response.data.get("startup_idea"),
            msg="Startup ideas do not match.",
        )
        self.assertEqual(
            self.profile.name,
            response.data.get("name"),
            msg="Company names do not match",
        )
        self.assertEqual(
            self.profile.is_registered,
            response.data.get("is_registered"),
            msg="Company is registered fields do not match.",
        )
        self.assertEqual(
            self.profile.is_startup,
            response.data.get("is_startup"),
            msg="Company is startup fields do not match.",
        )
        self.assertEqual(
            self.profile.service_info,
            response.data.get("service_info"),
            msg="Service info do not match.",
        )
        self.assertEqual(
            self.profile.product_info,
            response.data.get("product_info"),
            msg="Product info do not match.",
        )
        self.assertEqual(
            self.profile.banner,
            response.data.get("banner"),
            msg="Banner images do not match.",
        )
        self.assertEqual(
            self.profile.logo,
            response.data.get("logo"),
            msg="Logo images do not match.",
        )
        self.assertEqual(
            list(self.profile.categories.values("id", "name")),
            response.data.get("categories"),
            msg="Categories do not match.",
        )
        self.assertEqual(
            list(self.profile.activities.values("id", "name")),
            response.data.get("activities"),
            msg="Activities do not match.",
        )

    def test_get_profile_authorized_not_owner(self):
        profile2 = ProfileStartupFactory(
            official_name="Test Official Startup from test case"
        )
        self.client.force_authenticate(self.user)

        response = self.client.get(
            path="/api/profiles/{profile_id}".format(profile_id=profile2.id)
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNone(response.data.get("phone"))
        self.assertIsNone(response.data.get("email"))

        # fields check
        self.assertEqual(
            profile2.official_name,
            response.data.get("official_name"),
            msg="Official names do not match.",
        )
        self.assertFalse(
            response.data.get("regions"),
            msg="Regions do not match.",
        )
        self.assertEqual(
            profile2.common_info,
            response.data.get("common_info"),
            msg="Common info do not match.",
        )
        self.assertEqual(
            profile2.edrpou,
            response.data.get("edrpou"),
            msg="EDRPOUs do not match.",
        )
        self.assertEqual(
            profile2.founded,
            response.data.get("founded"),
            msg="Years of foundation do not match.",
        )
        self.assertEqual(
            profile2.address,
            response.data.get("address"),
            msg="Addresses do not match.",
        )
        self.assertEqual(
            profile2.startup_idea,
            response.data.get("startup_idea"),
            msg="Startup ideas do not match.",
        )
        self.assertEqual(
            profile2.name,
            response.data.get("name"),
            msg="Company names do not match",
        )
        self.assertEqual(
            profile2.is_registered,
            response.data.get("is_registered"),
            msg="Company is registered fields do not match.",
        )
        self.assertEqual(
            profile2.is_startup,
            response.data.get("is_startup"),
            msg="Company is startup fields do not match.",
        )
        self.assertEqual(
            profile2.service_info,
            response.data.get("service_info"),
            msg="Service info do not match.",
        )
        self.assertEqual(
            profile2.product_info,
            response.data.get("product_info"),
            msg="Product info do not match.",
        )
        self.assertEqual(
            profile2.banner,
            response.data.get("banner"),
            msg="Banner images do not match.",
        )
        self.assertEqual(
            profile2.logo,
            response.data.get("logo"),
            msg="Logo images do not match.",
        )
        self.assertEqual(
            list(profile2.categories.values("id", "name")),
            response.data.get("categories"),
            msg="Categories do not match.",
        )
        self.assertEqual(
            list(profile2.activities.values("id", "name")),
            response.data.get("activities"),
            msg="Activities do not match.",
        )

    def test_get_profile_authorized_owner(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(
            "/api/profiles/{profile_id}".format(profile_id=self.profile.id)
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)

        # fields check
        self.assertEqual(
            self.profile.id, response.data.get("id"), msg="IDs do not match."
        )
        self.assertEqual(
            self.profile.person.id,
            response.data.get("person"),
            msg="Persons do not match.",
        )
        self.assertFalse(
            response.data.get("is_saved"), msg="is_saved shouldn't be True."
        )
        self.assertEqual(
            self.profile.official_name,
            response.data.get("official_name"),
            msg="Official names do not match.",
        )
        self.assertEqual(
            list(self.profile.regions.all()),
            response.data.get("regions"),
            msg="Regions do not match.",
        )
        self.assertEqual(
            self.profile.common_info,
            response.data.get("common_info"),
            msg="Common info do not match.",
        )
        self.assertEqual(
            self.profile.phone,
            response.data.get("phone"),
            msg="Phone numbers do not match.",
        )
        self.assertEqual(
            self.profile.edrpou,
            response.data.get("edrpou"),
            msg="EDRPOUs do not match.",
        )
        self.assertEqual(
            self.profile.founded,
            response.data.get("founded"),
            msg="Years of foundation do not match.",
        )
        self.assertEqual(
            self.profile.address,
            response.data.get("address"),
            msg="Addresses do not match.",
        )
        self.assertEqual(
            self.profile.startup_idea,
            response.data.get("startup_idea"),
            msg="Startup ideas do not match.",
        )
        self.assertEqual(
            self.profile.name,
            response.data.get("name"),
            msg="Company names do not match",
        )
        self.assertEqual(
            self.profile.is_registered,
            response.data.get("is_registered"),
            msg="Company is registered fields do not match.",
        )
        self.assertEqual(
            self.profile.is_startup,
            response.data.get("is_startup"),
            msg="Company is startup fields do not match.",
        )
        self.assertEqual(
            self.profile.service_info,
            response.data.get("service_info"),
            msg="Service info do not match.",
        )
        self.assertEqual(
            self.profile.product_info,
            response.data.get("product_info"),
            msg="Product info do not match.",
        )
        self.assertEqual(
            self.profile.banner,
            response.data.get("banner"),
            msg="Banner images do not match.",
        )
        self.assertEqual(
            self.profile.logo,
            response.data.get("logo"),
            msg="Logo images do not match.",
        )
        self.assertEqual(
            list(self.profile.categories.values("id", "name")),
            response.data.get("categories"),
            msg="Categories do not match.",
        )
        self.assertEqual(
            list(self.profile.activities.values("id", "name")),
            response.data.get("activities"),
            msg="Activities do not match.",
        )

    def test_get_contact_info_unauthorized(self):
        response = self.client.get(
            path="/api/profiles/{profile_id}?with_contacts=True".format(
                profile_id=self.profile.id
            )
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            self.profile.phone,
            response.data.get("phone"),
            msg="Phone numbers do not match.",
        )
        self.assertEqual(
            self.profile.person.email,
            response.data.get("email"),
            msg="Emails do not match.",
        )

    def test_get_contact_info_authorized(self):
        user2 = UserFactory()
        self.client.force_authenticate(user2)

        response = self.client.get(
            path="/api/profiles/{profile_id}?with_contacts=True".format(
                profile_id=self.profile.id
            )
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(
            self.profile.phone,
            response.data.get("phone"),
            msg="Phone numbers do not match.",
        )
        self.assertEqual(
            self.profile.person.email,
            response.data.get("email"),
            msg="Emails do not match.",
        )

    # DELETE requests section
    def test_delete_profile_unauthorized(self):
        response = self.client.delete(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            )
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_delete_profile_authorized_with_correct_password(self):
        self.user.set_password("Test1234")
        self.client.force_authenticate(self.user)

        # del profile
        response = self.client.delete(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"password": "Test1234"},
        )
        self.assertEqual(204, response.status_code)

        # check the profile is deleted
        response = self.client.get(path="/api/profiles/")
        self.assertEqual(0, response.data["total_items"])
        self.profile.refresh_from_db()
        self.user.refresh_from_db()
        self.assertTrue(self.profile.is_deleted)
        self.assertFalse(self.user.is_active)

        # try access deleted profile
        response = self.client.get(
            "/api/profiles/{profile_id}".format(profile_id=self.profile.id)
        )
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_delete_profile_authorized_with_correct_password_check_user_email(
        self,
    ):
        self.user.set_password("Test1234")
        self.client.force_authenticate(self.user)

        with mock.patch("profiles.views.now") as mock_now:
            mock_now.return_value.strftime.return_value = "20240430120000"

            # del profile
            response = self.client.delete(
                path="/api/profiles/{profile_id}".format(
                    profile_id=self.profile.id
                ),
                data={"password": "Test1234"},
            )

        self.assertEqual(204, response.status_code)

        # check the user email after deletion
        expected_email = "is_deleted_20240430120000_test1@test.com"
        self.user.refresh_from_db()
        self.assertIn("20240430120000", self.user.email)
        self.assertIn("is_deleted", self.user.email)
        self.assertEqual(expected_email, self.user.email)

    def test_delete_profile_authorized_with_wrong_password(self):
        self.user.set_password("Test1234")
        self.client.force_authenticate(self.user)

        # del profile
        response = self.client.delete(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"password": "Test5678"},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {"password": ["Invalid password"]},
            response.json(),
        )

    def test_delete_profile_authorized_without_password(self):
        self.client.force_authenticate(self.user)

        # del profile
        response = self.client.delete(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            )
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            {"password": ["This field is required."]},
            response.json(),
        )

    def test_delete_profile_of_other_user_authorized(self):
        self.user.set_password("Test1234")
        profile2 = ProfileStartupFactory()
        self.client.force_authenticate(self.user)

        response = self.client.delete(
            path="/api/profiles/{profile_id}".format(profile_id=profile2.id),
            data={"password": "Test1234"},
        )
        self.assertEqual(403, response.status_code)

    # # PATCH requests section
    def test_partial_update_profile_authorized(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"official_name": "Test_company", "founded": 2005},
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(2005, response.data.get("founded"))
        self.assertEqual("Test_company", response.data.get("official_name"))

    def test_partial_update_authorized_not_owner(self):
        profile2 = ProfileStartupFactory()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(profile_id=profile2.id),
            data={"official_name": "Test_company", "founded": 2005},
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_partial_update_profile_unauthorized(self):
        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"official_name": "Test_company", "founded": 2005},
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_partial_update_profile_not_exist(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(profile_id=0),
            data={"official_name": "Test_company", "founded": 2005},
        )
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_partial_update_profile_wrong_data(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"official_name": 12345, "founded": "Jane"},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_partial_update_profile_official_name_empty_value(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"official_name": ""},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {"official_name": ["This field may not be blank."]},
        )

    def test_partial_update_profile_edrpou_empty_value(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": ""},
            format="json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNone(response.data.get("edrpou"))

    def test_partial_update_profile_rnokpp_empty_value(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"rnokpp": ""},
            format="json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNone(response.data.get("rnokpp"))

    # updating fields when another instance with empty fields already exists in db
    def test_partial_update_profile_fields_with_empty_values(self):
        ProfileStartupFactory.create(
            edrpou=None,
        )
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": ""},
            format="json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)

        self.profile.refresh_from_db()
        self.assertIsNone(self.profile.edrpou)

        response = self.client.get(path="/api/profiles/")
        self.assertEqual(2, response.data["total_items"])
        self.assertTrue(
            all(
                [
                    item.get("edrpou") is None
                    for item in response.data["results"]
                ]
            )
        )

    def test_partial_update_profile_is_fop_with_edrpou(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"is_fop": True},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {
                "is_fop": [
                    "For the EDRPOU field filled out, FOP must be set to False"
                ]
            },
        )

    def test_partial_update_profile_rnokpp(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "", "rnokpp": "1111111118"},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {
                "is_fop": [
                    "For the RNOKPP field filled out, FOP must be set to True"
                ]
            },
        )

    def test_partial_update_profile_is_fop_with_valid_rnokpp(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "", "is_fop": True, "rnokpp": "1234567899"},
            format="json",
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual("1234567899", response.data.get("rnokpp"))
        self.assertTrue(response.data.get("is_fop"))

    def test_partial_update_profile_is_fop_with_incorrect_length_rnokpp(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "", "is_fop": True, "rnokpp": "12345678"},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {"rnokpp": ["RNOKPP must be exactly 10 digits long."]},
        )

    def test_partial_update_profile_is_fop_with_incorrect_checksum_rnokpp(
        self,
    ):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "", "is_fop": True, "rnokpp": "1234567889"},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {"rnokpp": ["RNOKPP is not correct, checksum key is not valid."]},
        )

    def test_partial_update_profile_yurosoba_with_valid_edrpou(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "00112236"},
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual("00112236", response.data.get("edrpou"))

    def test_partial_update_profile_yurosoba_with_incorrect_length_edrpou(
        self,
    ):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "123456"},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {"edrpou": ["EDRPOU must be exactly 8 digits long."]},
        )

    def test_partial_update_profile_yurosoba_with_incorrect_checksum_edrpou(
        self,
    ):
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"edrpou": "12345677"},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json(),
            {"edrpou": ["EDRPOU is not correct, checksum key is not valid."]},
        )

    def test_partial_update_profile_category(self):
        category = CategoryFactory()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"categories": [category.id]},
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual([category.id], response.data.get("categories"))

    def test_partial_update_profile_activity(self):
        activity = ActivityFactory()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"activities": [activity.id]},
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual([activity.id], response.data.get("activities"))

    def test_partial_update_profile_region(self):
        region = RegionFactory()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"regions": [region.id]},
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual([region.id], response.data.get("regions"))

    # # PUT requests section
    def test_full_update_profile_authorized_with_partial_data(self):
        region = RegionFactory()
        self.client.force_authenticate(self.user)

        response = self.client.put(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"regions": [region.id], "phone": "380100109934"},
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    @mock.patch(
        "utils.moderation.image_moderation.ModerationManager.schedule_autoapprove"
    )
    @mock.patch(
        "utils.moderation.send_email.attach_image",
        new_callable=mock.mock_open,
        read_data=b"image",
    )
    def test_full_update_profile_authorized_with_full_data(
        self, mock_file, mock_autoapprove
    ):
        category = CategoryFactory()
        activity = ActivityFactory()
        region = RegionFactory()
        self.client.force_authenticate(self.user)

        response = self.client.put(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "official_name": "Official name from test case",
                "regions": [region.id],
                "common_info": "Common info from test case",
                "phone": "123456789012",
                "edrpou": "12345678",
                "founded": 2005,
                "service_info": "Service info from test case",
                "product_info": "Product info from test case",
                "address": "Kyiv",
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
                "person_position": "director",
                "startup_idea": "StartUp idea from test case",
                "is_startup": True,
                "is_registered": False,
                "name": "Comp name from test case",
                "categories": [category.id],
                "activities": [activity.id],
            },
        )
        self.assertEqual(
            status.HTTP_200_OK, response.status_code, response.content
        )
        mock_file.assert_called()
        mock_autoapprove.assert_called_once()

    def test_full_update_profile_unauthorized(self):
        category = CategoryFactory()
        activity = ActivityFactory()
        region = RegionFactory()

        response = self.client.put(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "person": self.user.id,
                "official_name": "Official name from test case",
                "regions": [region.id],
                "common_info": "Common info from test case",
                "phone": "123456789012",
                "edrpou": "12345678",
                "founded": 2005,
                "service_info": "Service info from test case",
                "product_info": "Product info from test case",
                "address": "Kyiv",
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
                "person_position": "director",
                "startup_idea": "StartUp idea from test case",
                "is_startup": True,
                "is_registered": False,
                "name": "Comp name from test case",
                "categories": [category.id],
                "activities": [activity.id],
            },
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_full_update_profile_not_exist(self):
        region = RegionFactory()
        self.client.force_authenticate(self.user)

        response = self.client.put(
            path="/api/profiles/{profile_id}".format(profile_id=0),
            data={
                "person": self.user.id,
                "official_name": "Official name from test case",
                "regions": [region.id],
                "common_info": "Common info from test case",
                "phone": "123456789012",
                "edrpou": "12345678",
                "founded": 2005,
                "service_info": "Service info from test case",
                "product_info": "Product info from test case",
                "address": "Kyiv",
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
                "person_position": "director",
                "startup_idea": "StartUp idea from test case",
                "is_startup": True,
                "is_registered": False,
                "name": "Comp name from test case",
            },
        )
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_full_update_profile_wrong_data(self):
        self.client.force_authenticate(self.user)

        response = self.client.put(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "person": self.user.id,
                "official_name": "Official name from test case",
                "regions": ["1"],
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
                "categories": ["5"],
                "activities": ["39"],
            },
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_full_update_authorized_not_owner(self):
        user2 = UserFactory()
        self.client.force_authenticate(user2)
        response = self.client.put(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={
                "person": self.user.id,
                "official_name": "Official name from test case",
                "regions": [1],
                "common_info": "Common info from test case",
                "phone": "123456789012",
                "edrpou": "12345678",
                "founded": 2005,
                "service_info": "Service info from test case",
                "product_info": "Product info from test case",
                "address": "Kyiv",
                "banner": self.banner.uuid,
                "logo": self.logo.uuid,
                "person_position": "director",
                "startup_idea": "StartUp idea from test case",
                "is_startup": True,
                "is_registered": False,
                "name": "Comp name from test case",
                "categories": [1],
                "activities": [2],
            },
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    # # POST requests section
    def test_create_profile_authorized_required_data_only(self):
        user2 = UserFactory()
        category = CategoryFactory()
        activity = ActivityFactory()
        region = RegionFactory()
        new_profile_data = {
            "person": user2.id,
            "categories": [category.id],
            "activities": [activity.id],
            "regions": [region.id],
        }
        self.client.force_authenticate(user2)

        response = self.client.post(
            path="/api/profiles/", data=new_profile_data
        )

        self.assertEqual(
            status.HTTP_201_CREATED, response.status_code, response.content
        )

        self.assertEqual(
            AnyInt(), response.data.get("id"), msg="IDs do not match."
        )
        self.assertEqual(
            user2.id, response.data.get("person"), msg="Persons do not match."
        )
        self.assertEqual(
            new_profile_data.get("name"),
            response.data.get("name"),
            msg="Company names do not match",
        )
        self.assertEqual(
            new_profile_data.get("categories"),
            response.data.get("categories"),
            msg="Categories do not match.",
        )
        self.assertEqual(
            new_profile_data.get("activities"),
            response.data.get("activities"),
            msg="Activities do not match.",
        )
        self.assertEqual(
            new_profile_data.get("regions"),
            response.data.get("regions"),
            msg="Regions do not match.",
        )

    def test_create_profile_authorized_full_data(self):
        user2 = UserFactory()
        category = CategoryFactory()
        activity = ActivityFactory()
        region = RegionFactory()
        new_profile_data = {
            "person": user2.id,
            "official_name": "Official name from test case",
            "regions": [region.id],
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
            "banner": self.banner.uuid,
            "logo": self.logo.uuid,
            "name": "Comp name from test case",
            "categories": [category.id],
            "activities": [activity.id],
        }

        self.client.force_authenticate(user2)

        response = self.client.post(
            path="/api/profiles/", data=new_profile_data
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        self.assertEqual(
            AnyInt(), response.data.get("id"), msg="IDs do not match."
        )
        self.assertEqual(
            user2.id, response.data.get("person"), msg="Persons do not match."
        )
        self.assertFalse(
            response.data.get("is_saved"), msg="is_saved shouldn't be True."
        )
        self.assertEqual(
            new_profile_data.get("official_name"),
            response.data.get("official_name"),
            msg="Official names do not match.",
        )
        self.assertEqual(
            new_profile_data.get("regions"),
            response.data.get("regions"),
            msg="Regions do not match.",
        )
        self.assertEqual(
            new_profile_data.get("common_info"),
            response.data.get("common_info"),
            msg="Common info do not match.",
        )
        self.assertEqual(
            new_profile_data.get("phone"),
            response.data.get("phone"),
            msg="Phone numbers do not match.",
        )
        self.assertEqual(
            new_profile_data.get("address"),
            response.data.get("address"),
            msg="Addresses do not match.",
        )
        self.assertEqual(
            new_profile_data.get("startup_idea"),
            response.data.get("startup_idea"),
            msg="Startup ideas do not match.",
        )
        self.assertEqual(
            new_profile_data.get("name"),
            response.data.get("name"),
            msg="Company names do not match",
        )
        self.assertEqual(
            new_profile_data.get("is_registered"),
            response.data.get("is_registered"),
            msg="Company is registered fields do not match.",
        )
        self.assertEqual(
            new_profile_data.get("is_startup"),
            response.data.get("is_startup"),
            msg="Company is startup fields do not match.",
        )
        self.assertEqual(
            new_profile_data.get("service_info"),
            response.data.get("service_info"),
            msg="Service info do not match.",
        )
        self.assertEqual(
            new_profile_data.get("product_info"),
            response.data.get("product_info"),
            msg="Product info do not match.",
        )
        self.assertEqual(
            new_profile_data.get("categories"),
            response.data.get("categories"),
            msg="Categories do not match.",
        )
        self.assertEqual(
            new_profile_data.get("activities"),
            response.data.get("activities"),
            msg="Activities do not match.",
        )

    def test_create_profile_unauthorized(self):
        user2 = UserFactory()
        category = CategoryFactory()
        activity = ActivityFactory()

        response = self.client.post(
            path="/api/profiles/",
            data={
                "person": user2.id,
                "categories": [category.id],
                "activities": [activity.id],
            },
        )
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, response.status_code)

    def test_create_profile_already_exists(self):
        category = CategoryFactory()
        activity = ActivityFactory()
        self.client.force_authenticate(self.user)

        response = self.client.post(
            path="/api/profiles/",
            data={
                "person": self.user.id,
                "categories": [category.id],
                "activities": [activity.id],
            },
        )
        self.assertEqual(status.HTTP_409_CONFLICT, response.status_code)

    def test_create_profile_wrong_data(self):
        user2 = UserFactory()
        self.client.force_authenticate(user2)

        response = self.client.post(
            path="/api/profiles/",
            data={
                "person": user2.id,
                "categories": ["1"],
                "activities": ["2"],
            },
        )
        self.assertEqual(400, response.status_code)

    def test_partial_update_profile_name_exceeds_character_limit(self):
        self.client.force_authenticate(self.user)

        long_name = "a" * 46
        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"name": long_name},
            format="json",
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

        self.assertEqual(
            response.json(),
            {"name": ["Ensure this field has no more than 45 characters."]},
        )

    def test_partial_update_profile_name_within_limit(self):
        self.client.force_authenticate(self.user)

        valid_name = "Valid Company Name"
        response = self.client.patch(
            path="/api/profiles/{profile_id}".format(
                profile_id=self.profile.id
            ),
            data={"name": valid_name},
            format="json",
        )

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        self.assertEqual(response.data.get("name"), valid_name)

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.name, valid_name)
