class ModerationAction:
    approve = "approve"
    reject = "reject"
    unblock = "unblock"

    @classmethod
    def choices(cls):
        return [
            (cls.approve, "approve"),
            (cls.reject, "reject"),
            (cls.unblock, "unblock"),
        ]
