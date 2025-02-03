import { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';

import ValidateCategory from '../../../utils/categoryValidation';

import styles from './CategoriesActions.module.css';

function CategoriesActions({ category, onActionComplete }) {
    const [categoryRename, setCategoryRename] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [error, setError] = useState('');

    const handleCategoryRename = async () => {
        if (!ValidateCategory(categoryRename, setError)) return;

        setIsUpdating(true);

        try {
            await axios.patch(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/categories/${category.id}/`,
                { name: categoryRename.trim() }
            );
            toast.success('Категорію успішно оновлено');
            setIsModalVisible(false);
            setCategoryRename('');
            if (onActionComplete) onActionComplete();
        } catch {
            toast.error('Не вдалося оновити категорію. Спробуйте ще раз.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsModalVisible(true)}>Змінити</Button>
            <Modal
                title={`Змінити назву ${category.name}`}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setError('');
                    setCategoryRename('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Скасувати
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        loading={isUpdating}
                        onClick={handleCategoryRename}
                    >
                        Зберегти
                    </Button>,
                ]}
                width={400}
            >
                <div className={styles.categoriesActionsModalContent}>
                    <Input
                        type="text"
                        placeholder="Введіть нову назву"
                        value={categoryRename}
                        onChange={(e) => {
                            const input = e.target.value;
                            setCategoryRename(input);
                            ValidateCategory(input, setError);
                        }}
                        className={styles.categoriesActionsInput}
                    />
                    {error && <p className={styles.categoriesActionsError}>{error}</p>}
                </div>
            </Modal>
        </>
    );
}

CategoriesActions.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    onActionComplete: PropTypes.func,
};

export default CategoriesActions;
