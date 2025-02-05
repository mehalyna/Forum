import { useState } from 'react';
import { Button, Input } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';

import validateCategory from '../../../utils/categoryValidation';

import styles from './CategoryAdd.module.css';

function CategoryAdd({ onActionComplete }) {
    const [categoryAddName, setCategoryAddName] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [error, setError] = useState('');

    const handleCategoryAdd = async () => {
        if (isAdded) return;

        setIsAdded(true);
        const isValid = await validateCategory(categoryAddName, setError);
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
            if (error.response && error.response.data.name) {
                const errorMessage = error.response.data.name[0];
                setError(
                    errorMessage === 'Category with this name already exists.'
                        ? 'Категорія з такою назвою вже існує.'
                        : errorMessage
                );
            } else {
                toast.error('Не вдалося створити категорію.');
            }
        } finally {
            setIsAdded(false);
        }
    };

    return (
        <div className={styles.categoryAddContainer}>
            <h3 className={styles.categoryAddTitle}>Додати нову категорію</h3>
            <Input
                type="text"
                placeholder="Введіть назву категорії"
                value={categoryAddName}
                onChange={(e) => {
                    setCategoryAddName(e.target.value);
                    validateCategory(e.target.value, setError);
                }}
                className={styles.categoryAddInput}
            />
            {error && <p className={styles.categoryAddError}>{error}</p>}
            <div className={styles.categoryAddButtonsBlock}>
                <Button
                    type="primary"
                    loading={isAdded}
                    onClick={handleCategoryAdd}
                    className={styles.categoryAddButton}
                >
                    Зберегти
                </Button>
                <Button
                    onClick={() => {
                        setError('');
                        setCategoryAddName('');
                    }}
                    className={styles.categoryAddButton}
                >
                    Скасувати
                </Button>
            </div>
        </div>
    );
}

CategoryAdd.propTypes = {
    onActionComplete: PropTypes.func,
};

export default CategoryAdd;
