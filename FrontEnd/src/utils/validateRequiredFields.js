export const REQUIRED_FIELDS_GENERAL_INFO = ['name', 'official_name', 'categories', 'activities'];
export const REQUIRED_FIELDS_USER_INFO = ['surname', 'name', 'email'];

export const validateRequiredFields = (profile, user) => {
    if (!profile || !user) return [];
    const missingFields = [];

    REQUIRED_FIELDS_GENERAL_INFO.forEach(field => {
        if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
            missingFields.push(field);
        }
    });

    REQUIRED_FIELDS_USER_INFO.forEach(field => {
        if (!user[field] || user[field].trim() === '') {
            missingFields.push(field);
        }
    });

    return missingFields;
};
