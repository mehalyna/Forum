from django.db import models
from django.db.models import Q


class ProfileManager(models.QuerySet):
    def active_only(self):
        return self.filter(is_deleted=False, person__is_active=True)

    def visible_only(self):
        return self.filter(
            is_deleted=False,
            person__is_active=True,
        ).exclude(
            Q(name__isnull=True)
            | Q(official_name__isnull=True)
            | Q(common_info="")
            | Q(categories__isnull=True)
            | Q(activities__isnull=True)
        )
