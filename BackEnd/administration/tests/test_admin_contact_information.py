from unittest.mock import patch, MagicMock
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import CustomUser
from administration.models import ContactInformation


class ContactsViewTest(APITestCase):
    """
    Tests for the ContactsView API.
    """

    def setUp(self):
        """
        Create a test admin user and initial contact information record.
        """
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
            "phone": "abc123",
        }

        self.missing_fields_data = {
            "company_name": "",
            "address": "",
            "email": "",
            "phone": "",
        }

    def test_get_contact_information(self):
        """
        Test retrieving contact information via the API.
        """
        response = self.client.get("/api/admin/contacts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["company_name"], "Initial Company")
        self.assertEqual(response.data["phone"], "380123456789")

    def test_update_contact_information_valid(self):
        """
        Test updating contact information with valid data.
        """
        response = self.client.put("/api/admin/contacts/", self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Contact information successfully updated.",
        )

        contact_info = ContactInformation.objects.get(pk=1)
        self.assertEqual(contact_info.company_name, "Updated Company")
        self.assertEqual(contact_info.phone, "380987654321")

    def test_update_contact_information_invalid_phone(self):
        """
        Test updating contact information with an invalid phone number.
        """
        response = self.client.put(
            "/api/admin/contacts/", self.invalid_phone_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_missing_fields(self):
        """
        Test updating contact information with missing required fields.
        """
        response = self.client.put(
            "/api/admin/contacts/", self.missing_fields_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("company_name", response.data)
        self.assertIn("address", response.data)
        self.assertIn("email", response.data)
        self.assertIn("phone", response.data)

    def test_no_existing_contact_information(self):
        """
        Test creating contact information when no record exists.
        """
        ContactInformation.objects.all().delete()

        response = self.client.get("/api/admin/contacts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(ContactInformation.objects.count(), 1)
        contact_info = ContactInformation.objects.first()
        self.assertEqual(contact_info.company_name, "")
        self.assertEqual(contact_info.phone, "")

    @patch("administration.views.backup_contact_info")
    def test_backup_failure(self, mock_backup):
        """
        Test behavior when backup_contact_info fails.
        """
        mock_backup.side_effect = Exception(
            "Backup failed!"
        )  # Simulate failure

        response = self.client.put("/api/admin/contacts/", self.valid_data)
        self.assertEqual(
            response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        self.assertEqual(
            response.data["message"], "Backup failed: Backup failed!"
        )

    @patch("administration.views.update_cache")
    def test_cache_update_failure(self, mock_update_cache):
        """
        Test behavior when update_cache fails.
        """
        mock_update_cache.side_effect = Exception(
            "Cache update failed!"
        )  # Simulate failure

        response = self.client.put("/api/admin/contacts/", self.valid_data)
        self.assertEqual(
            response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        self.assertEqual(
            response.data["message"],
            "Cache update failed: Cache update failed!",
        )

    @patch("administration.views.update_cache")
    @patch("administration.views.backup_contact_info")
    def test_backup_and_cache_success(self, mock_backup, mock_update_cache):
        """
        Test successful execution of backup_contact_info and update_cache.
        """
        mock_backup.return_value = None  # Simulate success
        mock_update_cache.return_value = None  # Simulate success

        response = self.client.put("/api/admin/contacts/", self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Contact information successfully updated.",
        )
