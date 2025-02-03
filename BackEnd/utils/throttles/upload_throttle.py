from rest_framework.throttling import ScopedRateThrottle


class UploadScopedRateThrottle(ScopedRateThrottle):
    scope = "upload"
