from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from administration.models import FeedbackCategory
from utils.images.send_email import set_admin_email

EMAIL_CONTENT_SUBTYPE = "html"
PROTOCOL = "http"


def send_email_feedback(user_email, message, category):
    """Function for sending feedback letters to the administrator and the user."""
    if isinstance(category, FeedbackCategory):
        category = category.name

    admin_email = set_admin_email() or settings.DEFAULT_ADMIN_EMAIL

    if isinstance(admin_email, str):
        admin_email = [admin_email]

    context = {
        "protocol": PROTOCOL,
        "category": category,
        "message": message,
        "user_email": user_email,
    }

    email_body_admin = render_to_string(
        "administration/admin_feedback_template.html", context
    )
    email_admin = EmailMultiAlternatives(
        subject=f"Нове повідомлення: {category}",
        body=email_body_admin,
        from_email=settings.EMAIL_HOST_USER,
        to=admin_email,
    )
    email_admin.content_subtype = EMAIL_CONTENT_SUBTYPE
    email_admin.send(fail_silently=False)

    email_body_user = render_to_string(
        "administration/user_feedback_template.html", context
    )
    email_user = EmailMultiAlternatives(
        subject="Копія вашого повідомлення",
        body=email_body_user,
        from_email=settings.EMAIL_HOST_USER,
        to=[user_email],
    )
    email_user.content_subtype = EMAIL_CONTENT_SUBTYPE
    email_user.send(fail_silently=False)
