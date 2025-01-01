import { useState } from 'react';
import { Button, Input } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './CategoryAdd.module.css';

function CategoryAdd({ onActionComplete }) {
    const [categoryAddName, setCategoryAddName] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [error, setError] = useState('');

    const validateCategory = async (category) => {
        const trimmedCategory = category.trim();
        const regex = /^[А-ЯЇЄҐ][а-яїієґА-ЯЇІЄҐ\s]*$/;

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
            setError('Помилка перевірки. Спробуйте пізніше.');
            return false;
        }

        setError('');
        return true;
    };


    const handleCategoryAdd = async () => {
        if (isAdded) return;

        setIsAdded(true);
        const isValid = await validateCategory(categoryAddName);
        if (!isValid) {
            setIsAdded(false);
            return;
        }

        try {
            await axios.post(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/categories/`,
                { name: categoryAddName.trim() }
            );
            toast.success('Успішно створено');
            setCategoryAddName('');
            if (onActionComplete) onActionComplete();
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Не вдалося створити категорію.');
        } finally {
            setIsAdded(false);
        }
    };

    return (
        <div className={styles.CategoryAddContainer}>
            <h3 className={styles.CategoryAddTitle}>Додайте категорію діяльності</h3>
            <p className={styles.CategoryAddText}>Назва категорії</p>
            <Input.TextArea
                rows={1}
                placeholder="Нова категорія"
                value={categoryAddName}
                onChange={(e) => {
                    const input = e.target.value;
                    setCategoryAddName(input);
                    validateCategory(input);
                }}
                className={styles.CategoryAddTextarea}
            />
            {error && <p className={styles.CategoryAddError}>{error}</p>}
            <div className={styles.CategoryAddButtonsBlock}>
                <>
                    <Button
                        onClick={() => {
                            setError('');
                            setCategoryAddName('');
                        }}
                    >
                        Відмінити
                    </Button>
                </>
                <>
                    <Button
                        type="primary"
                        loading={isAdded}
                        onClick={handleCategoryAdd}
                    >
                        Зберегти
                    </Button>
                </>
            </div>
        </div>
    );
}

CategoryAdd.propTypes = {
    onActionComplete: PropTypes.func,
};

export default CategoryAdd;
