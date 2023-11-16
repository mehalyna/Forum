# Generated by Django 4.2.3 on 2023-11-16 10:06

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0002_alter_activity_name_alter_category_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="common_info",
            field=models.TextField(
                default=None,
                null=True,
                validators=[django.core.validators.MaxLengthValidator(2000)],
            ),
        ),
        migrations.AlterField(
            model_name="profile",
            name="name",
            field=models.CharField(default=None, max_length=100, null=True),
        ),
    ]
