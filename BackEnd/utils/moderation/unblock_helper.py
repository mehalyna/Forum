def delete_images(profile, image_type, approved_image_type):
    image = getattr(profile, image_type, None)
    approved_image = getattr(profile, approved_image_type, None)

    if image:
        image.is_deleted = True
        image.save()
        setattr(profile, image_type, None)

    if approved_image:
        approved_image.is_deleted = True
        approved_image.save()
