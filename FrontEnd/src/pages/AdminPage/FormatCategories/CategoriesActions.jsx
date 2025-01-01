import { useState } from 'react';
import {Modal, Button, Input} from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './CategoriesActions.module.css';


function CategoriesActions({ category, onActionComplete }) {
    const [categoryRename, setCategoryRename] = useState('');
    const [isCreated, setIsCreated] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [error, setError] = useState('');

    const validateCategory = (category) => {
        if (category.trim().length >= 2) {
            setError('');
            return true;
        } else {
            setError('Назва категорії має бути не менше 2 символів.');
            return false;
        }
    };

    const handleCategoryRename = async () => {
        if (!validateCategory(categoryRename)) return;

        setIsCreated(true);
        try {
            await axios.patch(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/categories/${category.id}/`,
                {
                    name: categoryRename.trim(),
                }
            );
            toast.success('Успішно змінено');
            setCategoryRename('');
            setIsModalVisible(false);
            if (onActionComplete) onActionComplete();
        } catch {
            toast.error('Не вдалося змінити. Спробуйте ще раз.');
        } finally {
            setIsCreated(false);
        }
    };

    return (
        <>
            <Button key="cancel" onClick={() => setIsModalVisible(true)}>Змінити</Button>
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
                        Відмінити
                    </Button>,
                    <Button
                        key="send"
                        type="primary"
                        loading={isCreated}
                        onClick={handleCategoryRename}
                    >
                        Змінити
                    </Button>,
                ]}
                width={400}
            >
                <div className={styles.CategoriesActionsModalContent}>
                    <Input.TextArea
                        rows={1}
                        placeholder={`${category.name}`}
                        value={categoryRename}
                        width={50}
                        onChange={(e) => {
                            const input = e.target.value;
                            setCategoryRename(input);
                            validateCategory(input);
                        }}
                        className={styles.CategoriesActionsTextarea}
                    />
                    {error && <p className={styles.CategoriesActionsError}>{error}</p>}
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
