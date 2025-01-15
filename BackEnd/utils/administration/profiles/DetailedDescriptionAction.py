class DetailedDescriptionAction:
    block = "block"
    unblock = "unblock"

    @classmethod
    def choices(cls):
        return [
            (cls.block, "block"),
            (cls.unblock, "unblock"),
        ]
