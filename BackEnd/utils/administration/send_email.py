from decouple import config
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


EMAIL_CONTENT_SUBTYPE = "html"
PROTOCOL = "http"
DOMAIN = config("ALLOWED_ENV_HOST")


def send_email_about_admin_registration(email, password):
    context = {
        "protocol": PROTOCOL,
        "password": password,
        "domain": DOMAIN,
    }

    recipient = email
    email_body = render_to_string(
        "administration/email_template.html", context
    )
    email = EmailMultiAlternatives(
        subject="Реєстрація адміністратора на сайті CraftMerge",
        body=email_body,
        from_email=settings.EMAIL_HOST_USER,
        to=[
            recipient,
        ],
    )

    email.content_subtype = EMAIL_CONTENT_SUBTYPE
    email.send(fail_silently=False)
