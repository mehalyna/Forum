from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import CustomUser
from administration.models import ContactInformation


class ContactsViewTest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = CustomUser.objects.create_user(
            email="admin@example.com", password="admin123", is_staff=True
        )

        self.client.force_authenticate(user=self.admin_user)

        ContactInformation.objects.create(
            company_name="Initial Company",
            address="123 Initial Street",
            email="initial@example.com",
            phone="380123456789",
            admin_user=self.admin_user,
        )

        self.valid_data = {
            "company_name": "Updated Company",
            "address": "456 Updated Street",
            "email": "updated@example.com",
            "phone": "380987654321",
        }

        self.invalid_phone_data = {
            "company_name": "Invalid Company",
            "address": "789 Invalid Street",
            "email": "invalid@example.com",
            "phone": "123",
        }

    def test_get_contact_information(self):
        response = self.client.get("/api/admin/contacts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_response = {
            "company_name": "Initial Company",
            "address": "123 Initial Street",
            "email": "initial@example.com",
            "phone": "380123456789",
            "updated_at": response.data["updated_at"],
            "admin_user": self.admin_user.id,
        }

        self.assertEqual(response.data, expected_response)

        self.assertEqual(response.data["company_name"], "Initial Company")
        self.assertEqual(response.data["phone"], "380123456789")

    def test_update_contact_information_valid(self):
        response = self.client.put("/api/admin/contacts/", self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data["company_name"], "Updated Company")
        self.assertEqual(response.data["phone"], "380987654321")

        contact_info = ContactInformation.objects.get(pk=1)
        self.assertEqual(contact_info.company_name, "Updated Company")
        self.assertEqual(contact_info.phone, "380987654321")

    def test_update_contact_information_invalid_phone(self):
        response = self.client.put(
            "/api/admin/contacts/", self.invalid_phone_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)
