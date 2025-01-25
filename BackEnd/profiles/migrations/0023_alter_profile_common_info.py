# Generated by Django 4.2.3 on 2025-01-22 17:45

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0022_alter_profile_name_alter_profile_official_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="common_info",
            field=models.TextField(
                default="",
                validators=[django.core.validators.MaxLengthValidator(1000)],
            ),
        ),
    ]
