export const REQUIRED_FIELDS_GENERAL_INFO = ['name', 'official_name', 'categories', 'activities', 'common_info'];

export const validateRequiredFields = (profile) => {
    if (!profile) return [];
    const missingFields = [];

    REQUIRED_FIELDS_GENERAL_INFO.forEach((field) => {
        if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
            missingFields.push(field);
        }
    });

    return missingFields;
};