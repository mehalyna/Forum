from rest_framework.test import APITestCase

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    ProfileCompanyFactory,
)

from utils.dump_response import dump  # noqa


class TestCompanyFilter(APITestCase):
    def setUp(self) -> None:
        self.user = UserFactory()
        self.company_kyiv = ProfileCompanyFactory(
            name="Kyiv",
            official_name="Kyivbud",
            common_info="testing",
            service_info="official",
            product_info="fruits from Dnipro",
        )
        self.company_dnipro = ProfileStartupFactory(
            name="Dnipro",
            official_name="Dniprotrans",
            common_info="official",
            service_info="testing",
            product_info="our company is the best choice",
        )
        self.company_charkiv = ProfileStartupFactory(
            name="Charkiv",
            official_name="Charkivgreen",
            common_info="info",
            service_info="",
            product_info="official",
        )
        self.company_chernigiv = ProfileStartupFactory(
            name="Chernigiv",
            official_name="Chernigiveducation",
            common_info="info",
            service_info="official",
            product_info="testing",
        )
        self.company_kryvyi_rig = ProfileCompanyFactory(
            name="Kryvyi Rig",
            official_name="KryvyiRigindustry",
            common_info="official",
            service_info="also work in Kyiv",
            product_info="product info",
        )
        self.company_testing = ProfileStartupFactory(
            name="testing",
            official_name="official",
            common_info="info",
            service_info="",
            product_info="",
        )

    def test_get_search_in_all_companies_official_order_by_name(self):
        response = self.client.get(path="/api/search/advanced?search=official")
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(200, response.status_code)
        self.assertEqual(
            names_from_response,
            [
                "Charkiv",
                "Chernigiv",
                "Dnipro",
                "Kryvyi Rig",
                "Kyiv",
                "testing",
            ],
        )

    def test_get_search_name_service_info_lower_case(self):
        response = self.client.get(path="/api/search/advanced?search=kyiv")
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.data["total_items"])

    def test_get_search_name_service_info_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/advanced?search=kyiv")
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.data["total_items"])

    def test_get_search_name_service_info_upper_case(self):
        response = self.client.get(path="/api/search/advanced?search=KYIV")
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.data["total_items"])

    def test_get_search_parcial_item(self):
        response = self.client.get(path="/api/search/advanced?search=ch")
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(200, response.status_code)
        self.assertEqual(3, response.data["total_items"])
        self.assertEqual(
            names_from_response, ["Charkiv", "Chernigiv", "Dnipro"]
        )

    def test_get_search_not_exist(self):
        response = self.client.get(path="/api/search/advanced?search=QQQ")
        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.data["results"])

    def test_get_search_name_product_info(self):
        response = self.client.get(path="/api/search/advanced?search=dnipro")
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.data["total_items"])

    def test_get_search_name_service_product_common_info(self):
        response = self.client.get(path="/api/search/advanced?search=KYIV")
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(200, response.status_code)
        self.assertEqual(2, response.data["total_items"])
        self.assertEqual(names_from_response, ["Kryvyi Rig", "Kyiv"])

    def test_get_search_devide_item(self):
        response = self.client.get(
            path="/api/search/advanced?search=product info"
        )
        names_from_response = [
            prof["name"] for prof in response.data["results"]
        ]
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(names_from_response, ["Kryvyi Rig"])

    def test_advanced_search_serializer_fields(self):
        response = self.client.get(path="/api/search/advanced?search=fruits")

        expected_result = [
            {
                "id": self.company_kyiv.id,
                "name": "Kyiv",
                "official_name": "Kyivbud",
                "categories": list(
                    self.company_kyiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_kyiv.activities.values("id", "name")
                ),
                "regions": [],
                "regions_ukr_display": "",
                "common_info": "testing",
                "service_info": "official",
                "product_info": "fruits from Dnipro",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_kyiv.person_id,
            }
        ]
        self.assertEqual(expected_result, response.data["results"])
