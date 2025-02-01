import axios from 'axios';

const ValidateFeedbackCategory = async (category, setError) => {
    const trimmedCategory = category.trim();
    const regex = /^[А-ЯҐЄІЇ][а-яґєії]+(?:\s[А-ЯҐЄІЇа-яґєії]+)*$/u;

    if (trimmedCategory.length < 2 || trimmedCategory.length > 50) {
        setError('Назва категорії має бути від 2 до 50 символів.');
        return false;
    }

    if (!regex.test(trimmedCategory)) {
        setError('Назва категорії має починатися з великої літери, містити лише кириличні символи та пробіли між словами.');
        return false;
    }

    try {
        const response = await axios.get(
            `${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories/?name=${encodeURIComponent(trimmedCategory)}`
        );

        const categoryExists = response.data.results.some(
            (item) => item.name.toLowerCase() === trimmedCategory.toLowerCase()
        );

        if (categoryExists) {
            setError('Така категорія вже існує.');
            return false;
        }
    } catch {
        setError('Помилка перевірки. Спробуйте пізніше.');
        return false;
    }

    setError('');
    return true;
};

export default ValidateFeedbackCategory;
