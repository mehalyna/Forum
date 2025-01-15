
def format_company_type(obj):
    if obj.is_startup and obj.is_registered:
        return "Компанія і стартап"
    if obj.is_registered:
        return "Компанія"
    if obj.is_startup:
        return "Стартап"
    return None


def format_business_entity(obj):
    if obj.is_fop:
        return "ФОП"
    return "Юридична особа"
