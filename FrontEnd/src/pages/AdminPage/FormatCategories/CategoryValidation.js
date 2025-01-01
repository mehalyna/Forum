import axios from 'axios';

const ValidateCategory = async (category, setError) => {
    const trimmedCategory = category.trim();
    const regex = /^[А-ЯЇІЄҐ][а-яїієґА-ЯЇІЄҐ\s]*$/;

    if (trimmedCategory.length < 2 || trimmedCategory.length > 50) {
        setError('Назва категорії має бути від 2 до 50 символів.');
        return false;
    }

    if (!regex.test(trimmedCategory)) {
        setError('Назва категорії має починатися з великої літери та містити лише кириличні символи.');
        return false;
    }

    try {
        const response = await axios.get(
            `${process.env.REACT_APP_BASE_API_URL}/api/admin/categories/?name=${encodeURIComponent(trimmedCategory)}`
        );

        const categoryExists = response.data.results.some(
            (item) => item.name.toLowerCase() === trimmedCategory.toLowerCase()
        );

        if (categoryExists) {
            setError('Така категорія вже існує.');
            return false;
        }
    } catch (error) {
        console.error('Error checking category existence:', error);
        setError('Помилка перевірки. Спробуйте пізніше.');
        return false;
    }

    setError('');
    return true;
};

export default ValidateCategory;
