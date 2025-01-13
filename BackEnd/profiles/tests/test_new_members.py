from rest_framework.test import APITestCase
import os

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    ProfileCompanyFactory,
    ActivityFactory,
    CategoryFactory,
    RegionFactory,
)
from images.factories import ProfileimageFactory
from profiles.models import Profile

from utils.unittest_helper import utc_datetime
from utils.completeness_counter import completeness_count
from utils.dump_response import dump  # noqa


class TestCompletenessUpdate(APITestCase):
    def setUp(self) -> None:
        self.banner_path = os.path.join(
            os.getcwd(), "images/tests/img/img_2mb.png"
        )
        self.logo_path = os.path.join(
            os.getcwd(), "images/tests/img/img_300kb.png"
        )

        self.banner = ProfileimageFactory(image_path=self.banner_path)
        self.logo = ProfileimageFactory(image_path=self.logo_path)
        self.kryvyi_rig_user = UserFactory()

        self.cheese_category = CategoryFactory(name="cheese")
        self.sale_activity = ActivityFactory(name="sale")
        self.dnipro_region = RegionFactory(
            name_eng="Dnipro", name_ukr="Дніпро"
        )
        self.kyiv_region = RegionFactory(name_eng="Kyiv", name_ukr="Київ")

        self.company_kryvyi_rig = ProfileCompanyFactory(
            name="Kryvyi_rig_art",
            person=self.kryvyi_rig_user,
            regions=[self.dnipro_region],
            categories=[],
            activities=[],
        )

    def test_completeness_after_update_region(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"regions": [self.kyiv_region.id]},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        self.assertEqual(comp.completeness, 1)

    def test_completeness_after_update_activity(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        response = self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"activities": [self.sale_activity.id]},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        self.assertEqual(comp.completeness, 2)

    def test_completeness_after_update_logo(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"logo": self.logo.uuid},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        # assume, moderator approved logo and it was moved to logo_approved field
        comp.logo_approved = comp.logo
        comp.save()
        completeness_count(comp)
        self.assertEqual(comp.completeness, 2)

    def test_completeness_after_update_banner(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"banner": self.banner.uuid},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        # assume, moderator approved banner and it was moved to banner_approved field
        comp.banner_approved = comp.banner
        comp.save()
        completeness_count(comp)
        self.assertEqual(comp.completeness, 101)

    def test_completeness_after_update_category(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"categories": [self.cheese_category.id]},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        self.assertEqual(comp.completeness, 2)

    def test_completeness_after_update_banner_and_region(self):
        self.client.force_authenticate(self.kryvyi_rig_user)
        self.client.patch(
            path=f"/api/profiles/{self.company_kryvyi_rig.id}",
            data={"banner": self.banner.uuid, "region": "Kyiv"},
        )
        comp = Profile.objects.filter(name="Kryvyi_rig_art").first()
        # assume, moderator approved banner and it was moved to banner_approved field
        comp.banner_approved = comp.banner
        comp.save()
        completeness_count(comp)
        self.assertEqual(comp.completeness, 101)


class TestCompanyOrder(APITestCase):
    def setUp(self) -> None:
        self.kyiv_user = UserFactory()
        self.dnipro_user = UserFactory()
        self.kharkiv_user = UserFactory()
        self.chernigiv_user = UserFactory()
        self.kirovohrad_user = UserFactory()
        self.mykolaiv_user = UserFactory()
        self.odesa_user = UserFactory()
        self.synelnicovo_user = UserFactory()

        self.company_kyiv = ProfileCompanyFactory(
            name="Kyiv",
            person=self.kyiv_user,
            completeness=2,
        )
        self.company_kyiv.created_at = utc_datetime(2023, 12, 1)
        self.company_kyiv.save()

        self.company_dnipro = ProfileStartupFactory(
            name="Dnipro",
            person=self.dnipro_user,
            completeness=2,
        )
        self.company_dnipro.created_at = utc_datetime(2023, 12, 2)
        self.company_dnipro.save()

        self.company_kirovohrad = ProfileCompanyFactory(
            name="Kirovohrad",
            person=self.kirovohrad_user,
            completeness=3,
        )
        self.company_kirovohrad.created_at = utc_datetime(2023, 12, 5)
        self.company_kirovohrad.save()

    def test_get_less_companies(self):
        response = self.client.get(
            path="/api/profiles/?ordering=-completeness,-created_at&page_size=4"
        )
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(
            ["Kirovohrad", "Dnipro", "Kyiv"],
            names_from_response,
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(3, response.data["total_items"])
        self.assertEqual(1, response.data["current"])
        self.assertEqual(1, response.data["total_pages"])
        self.assertEqual(None, response.data["next"])

    def test_get_enough_companies(self):
        self.company_synelnicovo = ProfileStartupFactory(
            name="Synelnicovo",
            person=self.synelnicovo_user,
            completeness=5,
        )
        self.company_synelnicovo.created_at = utc_datetime(2023, 12, 7)
        self.company_synelnicovo.save()
        response = self.client.get(
            path="/api/profiles/?ordering=-completeness,-created_at&page_size=4"
        )
        self.assertEqual(200, response.status_code)
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]

        self.assertEqual(
            [
                "Synelnicovo",
                "Kirovohrad",
                "Dnipro",
                "Kyiv",
            ],
            names_from_response,
        )
        self.assertEqual(4, response.data["total_items"])
        self.assertEqual(1, response.data["current"])
        self.assertEqual(1, response.data["total_pages"])
        self.assertEqual(None, response.data["next"])

    def test_get_more_companies(self):
        self.company_mykolaiv = ProfileStartupFactory(
            name="Mykolaiv",
            person=self.mykolaiv_user,
            completeness=3,
        )
        self.company_mykolaiv.created_at = utc_datetime(2023, 12, 6)
        self.company_mykolaiv.save()

        self.company_odesa = ProfileStartupFactory(
            name="Odesa",
            person=self.odesa_user,
            completeness=5,
        )
        self.company_odesa.created_at = utc_datetime(2023, 12, 7)
        self.company_odesa.save()

        response = self.client.get(
            path="/api/profiles/?ordering=-completeness,-created_at&page_size=4"
        )
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(
            ["Odesa", "Mykolaiv", "Kirovohrad", "Dnipro"],
            names_from_response,
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(5, response.data["total_items"])
        self.assertEqual(1, response.data["current"])
        self.assertEqual(2, response.data["total_pages"])
        self.assertEqual(
            "http://testserver/api/profiles/?ordering=-completeness%2C-created_at&page=2&page_size=4",
            response.data["next"],
        )
