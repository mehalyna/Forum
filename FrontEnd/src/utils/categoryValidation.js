const validateCategory = (category, setError) => {
    const trimmedCategory = category.trim();
    const regex = /^[А-ЯҐЄІЇ][а-яґєії]+(?:\s[А-ЯҐЄІЇа-яґєії]+)*$/u;

    if (trimmedCategory.length < 2 || trimmedCategory.length > 50) {
        setError('Назва категорії має бути від 2 до 50 символів.');
        return false;
    }

    if (!regex.test(trimmedCategory)) {
        setError('Назва категорії має починатися з великої літери та містити лише кириличні символи.');
        return false;
    }

    setError('');
    return true;
};

export default validateCategory;
