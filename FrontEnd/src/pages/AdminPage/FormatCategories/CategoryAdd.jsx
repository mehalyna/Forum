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

    const validateMessage = (message) => {
        if (message.trim().length >= 2) {
            setError('');
            return true;
        } else {
            setError('Назва категорії має бути не менше 2 символів.');
            return false;
        }
    };

    const handleCategoryAdd = async () => {
        if (!validateMessage(categoryAddName)) return;

        setIsAdded(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/categories/`,
                {
                    name: categoryAddName.trim(),
                }
            );
            toast.success('Успішно створено');
            setCategoryAddName('');
            if (onActionComplete) onActionComplete();
        } catch {
            toast.error('Не вдалося змінити. Спробуйте ще раз.');
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
                    validateMessage(input);
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
