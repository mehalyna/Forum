# Generated by Django 4.2.3 on 2024-12-18 12:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("administration", "0004_moderationemail"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactInformation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("company_name", models.CharField(max_length=100)),
                ("address", models.TextField()),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=12)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "admin_user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
