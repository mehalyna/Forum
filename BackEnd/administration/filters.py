from django.db.models import Q
from django_filters import filters
from django_filters.rest_framework import FilterSet
from datetime import datetime, timedelta


class UsersFilter(FilterSet):
    """
    Filters
    /?name= /?surname=, /?email= , /?is_active= , /?is_staff=,
    /?is_superuser=,  /?is_deleted=True or False,  /?company_name=,
    /?registration_date=,
    Ordering sample
    /?ordering=id asc or /?ordering=-id desc
    """

    name = filters.CharFilter(lookup_expr="icontains")
    surname = filters.CharFilter(lookup_expr="icontains")
    email = filters.CharFilter(lookup_expr="icontains")
    is_active = filters.BooleanFilter()
    is_inactive = filters.BooleanFilter(method="is_inactive_filter")
    is_staff = filters.BooleanFilter()
    is_superuser = filters.BooleanFilter()
    is_deleted = filters.BooleanFilter(method="is_deleted_filter")
    company_name = filters.CharFilter(
        field_name="profile__name", lookup_expr="icontains"
    )
    registration_date = filters.CharFilter(
        field_name="profile__created_at", lookup_expr="icontains"
    )

    def is_inactive_filter(self, queryset, name, value):
        if value:
            queryset = queryset.filter(
                ~Q(email__startswith="is_deleted_"), is_active=False
            )
        return queryset

    def is_deleted_filter(self, queryset, name, value):
        if value:
            queryset = queryset.filter(email__startswith="is_deleted_")
        return queryset

    ordering = filters.OrderingFilter(
        fields=(
            ("name", "name"),
            ("surname", "surname"),
            ("email", "email"),
            ("is_active", "is_active"),
            ("is_staff", "is_staff"),
            ("is_superuser", "is_superuser"),
            ("is_deleted", "is_deleted"),
            ("profile__name", "company_name"),
            ("profile__created_at", "registration_date"),
        )
    )


class CategoriesFilter(FilterSet):
    id = filters.NumberFilter(lookup_expr="contains")
    name = filters.CharFilter(lookup_expr="icontains")
    ordering = filters.OrderingFilter(
        fields=(
            ("id", "id"),
            ("name", "name"),
        )
    )


class ProfileStatisticsFilter(FilterSet):
    """
    Filters
    /?period=
    """

    period = filters.CharFilter(method="period_filter")

    def period_filter(self, queryset, name, value):
        if value == "year":
            return queryset.filter(
                created_at__gte=datetime.now().replace(month=1, day=1),
                created_at__lte=datetime.now(),
            )
        elif value == "month":
            return queryset.filter(
                created_at__gte=datetime.now().replace(day=1),
                created_at__lte=datetime.now(),
            )
        elif value == "week":
            return queryset.filter(
                created_at__gte=datetime.now() - timedelta(days=7),
                created_at__lte=datetime.now(),
            )
        elif value == "day":
            return queryset.filter(
                created_at__gte=datetime.now() - timedelta(hours=24),
                created_at__lte=datetime.now(),
            )
