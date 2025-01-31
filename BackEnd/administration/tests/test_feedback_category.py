from rest_framework import status
from rest_framework.test import APITestCase
from administration.factories import FeedbackCategoryFactory, AdminUserFactory
from utils.unittest_helper import AnyInt, AnyStr


class TestFeedbackCategoryAPIUserNotStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(
            is_staff=False,
            is_active=True,
        )
        self.category = FeedbackCategoryFactory()
        self.client.force_authenticate(self.user)

    def test_get_feedback_categories_not_staff(self):
        response = self.client.get(path="/api/admin/feedback-categories/")
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_get_feedback_category_by_id_not_staff(self):
        response = self.client.get(
            path=f"/api/admin/feedback-categories/{self.category.id}/"
        )
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)


class TestFeedbackCategoryAPIUserStaff(APITestCase):
    def setUp(self):
        self.user = AdminUserFactory(
            is_staff=True,
            is_active=True,
        )
        self.categories = FeedbackCategoryFactory.create_batch(2)
        self.client.force_authenticate(self.user)

    def test_get_feedback_categories_staff(self):
        response = self.client.get(path="/api/admin/feedback-categories/")
        data = [
            {"id": AnyInt(), "name": AnyStr()},
            {"id": AnyInt(), "name": AnyStr()},
        ]
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(data, response.json()["results"])

    def test_get_feedback_category_by_id_staff(self):
        category = FeedbackCategoryFactory.create()
        response = self.client.get(
            path=f"/api/admin/feedback-categories/{category.id}/"
        )
        data = {"id": category.id, "name": category.name}
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(data, response.json())

    def test_post_new_feedback_category_staff(self):
        data = {"name": "User Experience"}
        response = self.client.post(
            path="/api/admin/feedback-categories/", data=data
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])
        self.assertIn("id", response.json())

    def test_post_duplicate_feedback_category_staff(self):
        existing_category = FeedbackCategoryFactory.create(name="Bug Report")
        data = {"name": "Bug Report"}
        response = self.client.post(
            path="/api/admin/feedback-categories/", data=data
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertEqual(
            response.json()["name"][0],
            "A category with this name already exists.",
        )

    def test_put_feedback_category_staff(self):
        category = FeedbackCategoryFactory.create()
        data = {"name": "New Category Name"}
        response = self.client.put(
            path=f"/api/admin/feedback-categories/{category.id}/", data=data
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])

    def test_patch_feedback_category_staff(self):
        category = FeedbackCategoryFactory.create()
        data = {"name": "Updated Category"}
        response = self.client.patch(
            path=f"/api/admin/feedback-categories/{category.id}/", data=data
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(response.json()["name"], data["name"])

    def test_delete_feedback_category_staff(self):
        category = FeedbackCategoryFactory.create()
        response = self.client.delete(
            path=f"/api/admin/feedback-categories/{category.id}/"
        )
        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
