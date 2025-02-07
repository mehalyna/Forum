from decouple import config
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from administration.models import ModerationEmail

EMAIL_CONTENT_SUBTYPE = "html"
PROTOCOL = "http"
DOMAIN = config("ALLOWED_ENV_HOST")


def set_admin_email():
    instance = ModerationEmail.objects.first()
    if instance:
        email = instance.email_moderation
    else:
        email = settings.EMAIL_HOST_USER
    return email


def send_email_about_banners_and_logos(
    num_of_banners, num_of_logos, size_of_banners_kb, size_of_logos_kb
):
    context = {
        "protocol": PROTOCOL,
        "num_of_banners": num_of_banners,
        "num_of_logos": num_of_logos,
        "size_of_banners": size_of_banners_kb,
        "size_of_logos": size_of_logos_kb,
    }

    recipient = set_admin_email()
    email_body = render_to_string("images/email_template.html", context)
    email = EmailMultiAlternatives(
        subject="Кількість та розмір зображень, завантажених на сайті CraftMerge",
        body=email_body,
        from_email=settings.EMAIL_HOST_USER,
        to=[
            recipient,
        ],
    )

    email.content_subtype = EMAIL_CONTENT_SUBTYPE
    email.send(fail_silently=False)
