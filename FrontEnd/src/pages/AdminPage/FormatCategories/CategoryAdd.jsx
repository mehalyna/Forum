import { useState } from 'react';
import { Button, Input } from 'antd';
import { toast } from 'react-toastify';
import ValidateCategory from './CategoryValidation';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './CategoryAdd.module.css';

function CategoryAdd({ onActionComplete }) {
    const [categoryAddName, setCategoryAddName] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [error, setError] = useState('');
    const handleCategoryAdd = async () => {
        if (isAdded) return;

        setIsAdded(true);
        const isValid = await ValidateCategory(categoryAddName, setError);
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
                    ValidateCategory(input, setError);
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