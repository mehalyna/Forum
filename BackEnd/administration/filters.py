from django_filters import filters
from django_filters.rest_framework import FilterSet


class UsersFilter(FilterSet):
    """
    Filters
    /?id= , /?surname=, /?email= , /?is_active= , /?is_staff=,
    /?is_superuser=,  /?is_deleted=True or False,  /?company_name=, /?registration_date=,
    Ordering sample
    /?ordering=id asc or /?ordering=-id desc
    """

    id = filters.NumberFilter(lookup_expr="contains")
    surname = filters.CharFilter(lookup_expr="icontains")
    email = filters.CharFilter(lookup_expr="icontains")
    is_active = filters.BooleanFilter()
    is_staff = filters.BooleanFilter()
    is_superuser = filters.BooleanFilter()
    is_deleted = filters.BooleanFilter(method="is_deleted_filter")
    company_name = filters.CharFilter(
        field_name="profile__name", lookup_expr="icontains"
    )
    registration_date = filters.DateFilter(
        field_name="profile__created_at",
    )

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


class ProfilesFilter(FilterSet):
    """
    Filters
    /?name= , /?representative= , /?official_name= , /?phone= , /?address= ,
    /?created_at= , /?updated_at= ,
    Ordering sample:
    /?ordering=id asc or /?ordering=-id desc
    """

    name = filters.CharFilter(lookup_expr="icontains")
    representative = filters.CharFilter(
        field_name="representative", lookup_expr="icontains"
    )
    official_name = filters.CharFilter(lookup_expr="icontains")
    phone = filters.CharFilter(lookup_expr="icontains")
    address = filters.CharFilter(lookup_expr="icontains")
    created_at = filters.DateFilter()
    updated_at = filters.DateFilter()

    ordering = filters.OrderingFilter(
        fields=(
            ("name", "name"),
            ("is_registered", "is_registered"),
            ("representative", "representative"),
            ("official_name", "official_name"),
            ("phone", "phone"),
            ("address", "address"),
            ("status", "status"),
            ("created_at", "created_at"),
            ("updated_at", "updated_at"),
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
