from .settings import *

PASSWORD_HASHERS = ("django.contrib.auth.hashers.MD5PasswordHasher",)
DELAY_FOR_LOGIN = 3
ATTEMPTS_FOR_LOGIN = 2
DELAY_FOR_UPLOADS = 600
MAX_UPLOADS = 1
