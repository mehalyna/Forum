# Generated by Django 4.2.3 on 2024-03-29 14:56

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0011_profile_ipn_profile_is_fop"),
    ]

    operations = [
        migrations.CreateModel(
            name="Region",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name_eng", models.CharField(max_length=150, unique=True)),
                ("name_ukr", models.CharField(max_length=150, unique=True)),
            ],
        ),
        migrations.RemoveField(
            model_name="profile",
            name="region",
        ),
        migrations.AddField(
            model_name="profile",
            name="regions",
            field=models.ManyToManyField(to="profiles.region"),
        ),
    ]
