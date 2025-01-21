from rest_framework import status
from rest_framework.test import APITestCase

from authentication.factories import UserFactory
from profiles.factories import (
    ProfileStartupFactory,
    ProfileCompanyFactory,
    RegionFactory,
)

from utils.dump_response import dump  # noqa


class TestCompanyFilter(APITestCase):
    maxDiff = None

    def setUp(self) -> None:
        self.user = UserFactory()
        self.kyiv_region = RegionFactory(name_eng="Kyiv", name_ukr="Київ")
        self.dnipro_region = RegionFactory(
            name_eng="Dnipro", name_ukr="Дніпро"
        )
        self.kharkiv_region = RegionFactory(
            name_eng="Kharkiv", name_ukr="Харків"
        )
        self.chernihiv_region = RegionFactory(
            name_eng="Chernihiv", name_ukr="Чернігів"
        )
        self.company_kiev = ProfileCompanyFactory(
            name="Kyivbud", regions=[self.kyiv_region]
        )
        self.company_dnipro = ProfileStartupFactory(
            name="Dniprotrans", regions=[self.dnipro_region]
        )
        self.company_charkiv = ProfileStartupFactory(
            name="Charkivmarket", regions=[self.kharkiv_region]
        )
        self.company_chernigiv = ProfileStartupFactory(
            name="Chernigivtravel", regions=[self.chernihiv_region]
        )

    def test_get_profile_filtered_by_name_unauthorized(self):
        response = self.client.get(path="/api/search/?name=Kyivbud")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])

    def test_get_profile_filtered_by_region_eng_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_eng=Dnipro")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_eng_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_eng=Dnipro")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_ukr=Дніпро")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_ukr=Дніпро")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_partial_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_ukr=Дніп")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_partial_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_ukr=Дніпро")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_lower_case_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_ukr=дніпро")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_dnipro.id,
                    "name": "Dniprotrans",
                    "categories": list(
                        self.company_dnipro.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_dnipro.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.dnipro_region.id,
                            "name_eng": "Dnipro",
                            "name_ukr": "Дніпро",
                        }
                    ],
                    "regions_ukr_display": "Дніпро",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_dnipro.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_region_ukr_not_exist_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_ukr=УУ")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_region_eng_not_exist_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_eng=WWWW")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_region_ukr_not_exist_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_ukr=УУ")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_region_eng_not_exist_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_eng=WWWW")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_name_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?name=Kyivbud")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profiles_without_filter_unauthorized(self):
        response = self.client.get(path="/api/search/")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])

    def test_get_profiles_without_filter_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])

    def test_get_profiles_filter_wrong_name_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?name=Chernovcimilk")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profiles_filter_wrong_name_unauthorized(self):
        response = self.client.get(path="/api/search/?name=Chernovcimilk")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_name_and_region_eng_unauthorized(self):
        response = self.client.get(
            path="/api/search/?name=Kyivbud&regions_eng=Kyiv"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_name_and_region_eng_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Kyivbud&region=Kyiv"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_wrong_name_and_region_ukr_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Pizza&regions_ukr=Київ"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_wrong_name_and_region_ukr_unauthorized(
        self,
    ):
        response = self.client.get(path="/api/search/?name=Pizza&region=Київ")
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_name_and_wrong_region_eng_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Kyivbud&regions_eng=Ghernigiv"
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_name_and_wrong_region_unauthorized(self):
        response = self.client.get(
            path="/api/search/?name=Kyivbud&regions_eng=Ghernigiv"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_wrong_name_and_wrong_region_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Pizza&regions_eng=London"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_wrong_name_and_wrong_region_unauthorized(
        self,
    ):
        response = self.client.get(
            path="/api/search/?name=Pizza&regions_ukr=Лондон"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_filtered_by_region_eng_partially_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?regions_eng=Dnip")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])

    def test_get_profile_filtered_by_region_eng_partially_unauthorized(self):
        response = self.client.get(path="/api/search/?regions_eng=Dnip")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])

    def test_get_profile_filtered_by_name_partially_authorized(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(path="/api/search/?name=Kyiv")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_name_partially_unauthorized(self):
        response = self.client.get(path="/api/search/?name=Kyiv")
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_name_and_region_eng_partialyy_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Kyiv&regions_eng=Ky"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.data["total_items"])
        self.assertEqual(
            [
                {
                    "id": self.company_kiev.id,
                    "name": "Kyivbud",
                    "categories": list(
                        self.company_kiev.categories.values("id", "name")
                    ),
                    "activities": list(
                        self.company_kiev.activities.values("id", "name")
                    ),
                    "regions": [
                        {
                            "id": self.kyiv_region.id,
                            "name_eng": "Kyiv",
                            "name_ukr": "Київ",
                        }
                    ],
                    "regions_ukr_display": "Київ",
                    "founded": 2022,
                    "address": "Test Country, Test City, St. Test, 1",
                    "banner": None,
                    "logo": None,
                    "person": self.company_kiev.person_id,
                    "is_saved": False,
                }
            ],
            response.data["results"],
        )

    def test_get_profile_filtered_by_wrong_name_and_wrong_region_partially_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        response = self.client.get(
            path="/api/search/?name=Kyivf&regions_eng=Kyif"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, response.data["total_items"])
        self.assertEqual([], response.data["results"])

    def test_get_profile_ordered_by_name_asc_unauthorized(
        self,
    ):
        ordered_response_data = [
            {
                "id": self.company_charkiv.id,
                "name": "Charkivmarket",
                "categories": list(
                    self.company_charkiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_charkiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kharkiv_region.id,
                        "name_eng": "Kharkiv",
                        "name_ukr": "Харків",
                    }
                ],
                "regions_ukr_display": "Харків",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_charkiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_chernigiv.id,
                "name": "Chernigivtravel",
                "categories": list(
                    self.company_chernigiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_chernigiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.chernihiv_region.id,
                        "name_eng": "Chernihiv",
                        "name_ukr": "Чернігів",
                    }
                ],
                "regions_ukr_display": "Чернігів",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_chernigiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_dnipro.id,
                "name": "Dniprotrans",
                "categories": list(
                    self.company_dnipro.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_dnipro.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.dnipro_region.id,
                        "name_eng": "Dnipro",
                        "name_ukr": "Дніпро",
                    }
                ],
                "regions_ukr_display": "Дніпро",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_dnipro.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_kiev.id,
                "name": "Kyivbud",
                "categories": list(
                    self.company_kiev.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_kiev.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kyiv_region.id,
                        "name_eng": "Kyiv",
                        "name_ukr": "Київ",
                    }
                ],
                "regions_ukr_display": "Київ",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_kiev.person_id,
                "is_saved": False,
            },
        ]

        response = self.client.get(path="/api/search/?ordering=name")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])
        self.assertEqual(ordered_response_data, response.data["results"])

    def test_get_profile_ordered_by_name_asc_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        ordered_response_data = [
            {
                "id": self.company_charkiv.id,
                "name": "Charkivmarket",
                "categories": list(
                    self.company_charkiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_charkiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kharkiv_region.id,
                        "name_eng": "Kharkiv",
                        "name_ukr": "Харків",
                    }
                ],
                "regions_ukr_display": "Харків",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_charkiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_chernigiv.id,
                "name": "Chernigivtravel",
                "categories": list(
                    self.company_chernigiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_chernigiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.chernihiv_region.id,
                        "name_eng": "Chernihiv",
                        "name_ukr": "Чернігів",
                    }
                ],
                "regions_ukr_display": "Чернігів",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_chernigiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_dnipro.id,
                "name": "Dniprotrans",
                "categories": list(
                    self.company_dnipro.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_dnipro.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.dnipro_region.id,
                        "name_eng": "Dnipro",
                        "name_ukr": "Дніпро",
                    }
                ],
                "regions_ukr_display": "Дніпро",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_dnipro.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_kiev.id,
                "name": "Kyivbud",
                "categories": list(
                    self.company_kiev.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_kiev.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kyiv_region.id,
                        "name_eng": "Kyiv",
                        "name_ukr": "Київ",
                    }
                ],
                "regions_ukr_display": "Київ",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_kiev.person_id,
                "is_saved": False,
            },
        ]

        response = self.client.get(path="/api/search/?ordering=name")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])
        self.assertEqual(ordered_response_data, response.data["results"])

    def test_get_profile_ordered_by_name_dsc_unauthorized(
        self,
    ):
        ordered_response_data = [
            {
                "id": self.company_kiev.id,
                "name": "Kyivbud",
                "categories": list(
                    self.company_kiev.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_kiev.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kyiv_region.id,
                        "name_eng": "Kyiv",
                        "name_ukr": "Київ",
                    }
                ],
                "regions_ukr_display": "Київ",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_kiev.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_dnipro.id,
                "name": "Dniprotrans",
                "categories": list(
                    self.company_dnipro.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_dnipro.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.dnipro_region.id,
                        "name_eng": "Dnipro",
                        "name_ukr": "Дніпро",
                    }
                ],
                "regions_ukr_display": "Дніпро",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_dnipro.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_chernigiv.id,
                "name": "Chernigivtravel",
                "categories": list(
                    self.company_chernigiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_chernigiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.chernihiv_region.id,
                        "name_eng": "Chernihiv",
                        "name_ukr": "Чернігів",
                    }
                ],
                "regions_ukr_display": "Чернігів",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_chernigiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_charkiv.id,
                "name": "Charkivmarket",
                "categories": list(
                    self.company_charkiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_charkiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kharkiv_region.id,
                        "name_eng": "Kharkiv",
                        "name_ukr": "Харків",
                    }
                ],
                "regions_ukr_display": "Харків",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_charkiv.person_id,
                "is_saved": False,
            },
        ]

        response = self.client.get(path="/api/search/?ordering=-name")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])
        self.assertEqual(ordered_response_data, response.data["results"])

    def test_get_profile_ordered_by_name_dsc_authorized(
        self,
    ):
        self.client.force_authenticate(self.user)
        ordered_response_data = [
            {
                "id": self.company_kiev.id,
                "name": "Kyivbud",
                "categories": list(
                    self.company_kiev.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_kiev.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kyiv_region.id,
                        "name_eng": "Kyiv",
                        "name_ukr": "Київ",
                    }
                ],
                "regions_ukr_display": "Київ",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_kiev.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_dnipro.id,
                "name": "Dniprotrans",
                "categories": list(
                    self.company_dnipro.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_dnipro.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.dnipro_region.id,
                        "name_eng": "Dnipro",
                        "name_ukr": "Дніпро",
                    }
                ],
                "regions_ukr_display": "Дніпро",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_dnipro.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_chernigiv.id,
                "name": "Chernigivtravel",
                "categories": list(
                    self.company_chernigiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_chernigiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.chernihiv_region.id,
                        "name_eng": "Chernihiv",
                        "name_ukr": "Чернігів",
                    }
                ],
                "regions_ukr_display": "Чернігів",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_chernigiv.person_id,
                "is_saved": False,
            },
            {
                "id": self.company_charkiv.id,
                "name": "Charkivmarket",
                "categories": list(
                    self.company_charkiv.categories.values("id", "name")
                ),
                "activities": list(
                    self.company_charkiv.activities.values("id", "name")
                ),
                "regions": [
                    {
                        "id": self.kharkiv_region.id,
                        "name_eng": "Kharkiv",
                        "name_ukr": "Харків",
                    }
                ],
                "regions_ukr_display": "Харків",
                "founded": 2022,
                "address": "Test Country, Test City, St. Test, 1",
                "banner": None,
                "logo": None,
                "person": self.company_charkiv.person_id,
                "is_saved": False,
            },
        ]

        response = self.client.get(path="/api/search/?ordering=-name")
        self.assertEqual(200, response.status_code)
        self.assertEqual(4, response.data["total_items"])
        self.assertEqual(ordered_response_data, response.data["results"])
