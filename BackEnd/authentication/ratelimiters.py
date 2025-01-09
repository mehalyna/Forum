from functools import wraps
from math import floor
import redis
import time
import sys
import threading
from django.conf import settings

now = time.monotonic if hasattr(time, 'monotonic') else time.time

FALLBACK_REDIS_KEY = "fallback"

class LoginRateLimit(object):

    def __init__(self, calls=15, period=900, clock=now, raise_on_limit=True):
        self.clamped_calls = max(1, min(sys.maxsize, floor(calls)))
        self.period = period
        self.clock = clock
        self.raise_on_limit = raise_on_limit
        self.last_reset = clock()
        self.lock = threading.RLock()
        self.redis_conn = None
        
        
    def __call__(self, func):

        @wraps(func)
        def wrapper(*args, **kargs):

            redis_conn = self.redis_conn or self.__get_redis_connection()
            if redis_conn:
                with self.lock:
                    request = args[0].context["request"]
                    client_ip = self.__get_client_ip(request) or FALLBACK_REDIS_KEY
                    period_remaining = self.__period_remaining()

                    if period_remaining <= 0:
                        redis_conn.set(client_ip, 0, ex=60*20)
                        self.last_reset = self.clock()

                    redis_conn.incr(client_ip)

                    count = int(redis_conn.get(client_ip).decode())

                    if count > self.clamped_calls:
                        if self.raise_on_limit:
                            raise RateLimitException('too many calls', period_remaining)
                        return

            return func(*args, **kargs)
        return wrapper

    def __get_redis_connection(self):
        try:
            conn = redis.Redis(
                host=settings.RATELIMIT_REDIS_HOST,
                port=settings.RATELIMIT_REDIS_PORT,
                db=settings.RATELIMIT_REDIS_DB,
                socket_connect_timeout=0.5
            )
            conn.ping()
            self.redis_conn = conn
            return conn
            
        except (redis.ConnectionError, redis.TimeoutError):
            return None
                

    def __period_remaining(self):
        elapsed = self.clock() - self.last_reset
        return self.period - elapsed

    def __get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RateLimitException(Exception):

    def __init__(self, message, period_remaining):

        super(RateLimitException, self).__init__(message)
        self.period_remaining = period_remaining