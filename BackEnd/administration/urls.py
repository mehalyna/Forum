from django.urls import path

from administration.views import (
    ContactsView,
    ProfilesListView,
    ProfileDetailView,
    ProfileStatisticsView,
    MonthlyProfileStatisticsView,
    UsersListView,
    UserDetailView,
    AutoModerationHoursView,
    ModerationEmailView,
    FeedbackView,
    CreateAdminUserView,
    CategoriesListView,
    CategoryDetailView,
    SendMessageView,
    ModerationProfilesView,
)

app_name = "administration"

urlpatterns = [
    path("users/", UsersListView.as_view(), name="users-list"),
    path("users/<pk>/", UserDetailView.as_view(), name="user-detail"),
    path("profiles/", ProfilesListView.as_view(), name="profile-list"),
    path(
        "profiles/statistics/",
        ProfileStatisticsView.as_view(),
        name="profile-statistics",
    ),
    path(
        "profiles/statistics/monthly/",
        MonthlyProfileStatisticsView.as_view(),
        name="profile-statistics-monthly",
    ),
    path("profiles/<pk>/", ProfileDetailView.as_view(), name="profile-detail"),
    path(
        "moderation-profiles/<pk>/",
        ModerationProfilesView.as_view(),
        name="moderation-profiles",
    ),
    path(
        "automoderation/",
        AutoModerationHoursView.as_view(),
        name="automoderation_hours",
    ),
    path("email/", ModerationEmailView.as_view(), name="moderation-email"),
    path("contacts/", ContactsView.as_view(), name="contacts"),
    path("feedback/", FeedbackView.as_view(), name="feedback"),
    path("admin_create/", CreateAdminUserView.as_view(), name="admin-create"),
    path(
        "categories/",
        CategoriesListView.as_view(),
        name="categories",
    ),
    path(
        "categories/<pk>/",
        CategoryDetailView.as_view(),
        name="category_detail",
    ),
    path(
        "users/<pk>/send_message/",
        SendMessageView.as_view(),
        name="send-message",
    ),
]
