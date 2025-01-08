from celery import shared_task
from datetime import timedelta

from django.db.models import Sum, Count
from django.utils import timezone

from utils.images.send_email import send_email_about_banners_and_logos
from .models import ProfileImage


@shared_task()
def celery_send_email_images():
    now = timezone.now()
    photos = ProfileImage.objects.filter(
        created_at__gte=now - timedelta(days=30)
    )
    logo_data = photos.filter(image_type=ProfileImage.LOGO).aggregate(
        total_size=Sum("image_size"), count=Count("uuid")
    )
    banner_data = photos.filter(image_type=ProfileImage.BANNER).aggregate(
        total_size=Sum("image_size"), count=Count("uuid")
    )

    logo_total_size_kb = round((logo_data["total_size"] or 0) / 1024, 2)
    banner_total_size_kb = round((banner_data["total_size"] or 0) / 1024, 2)

    send_email_about_banners_and_logos(
        banner_data["count"],
        logo_data["count"],
        banner_total_size_kb,
        logo_total_size_kb,
    )
