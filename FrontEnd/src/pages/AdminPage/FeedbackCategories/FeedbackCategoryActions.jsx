import { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';

import ValidateFeedbackCategory from '../../../utils/validateFeedbackCategory';

import styles from './FeedbackCategoryActions.module.css';

function FeedbackCategoryActions({ category, onActionComplete }) {
    const [feedbackCategoryRename, setFeedbackCategoryRename] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [error, setError] = useState('');

    const handleFeedbackCategoryRename = async () => {
        if (!feedbackCategoryRename.trim()) {
            setError('Назва категорії не може бути порожньою.');
            return;
        }

        const isValid = await ValidateFeedbackCategory(feedbackCategoryRename, setError);
        if (!isValid) return;

        setIsUpdating(true);
        try {
            await axios.patch(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories/${category.id}/`,
                {
                    name: feedbackCategoryRename.trim(),
                }
            );
            toast.success('Категорію успішно оновлено');
            setIsModalVisible(false);
            setFeedbackCategoryRename('');
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
                    setFeedbackCategoryRename('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Скасувати
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        loading={isUpdating}
                        onClick={handleFeedbackCategoryRename}
                    >
                        Зберегти
                    </Button>,
                ]}
                width={400}
            >
                <div className={styles.feedbackCategoryActionsModalContent}>
                    <Input
                        type="text"
                        placeholder="Введіть нову назву"
                        value={feedbackCategoryRename}
                        onChange={(e) => {
                            setFeedbackCategoryRename(e.target.value);
                            setError('');
                        }}
                        className={styles.feedbackCategoryActionsInput}
                    />
                    {error && <p className={styles.feedbackCategoryActionsError}>{error}</p>}
                </div>
            </Modal>
        </>
    );
}

FeedbackCategoryActions.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,
    onActionComplete: PropTypes.func,
};

export default FeedbackCategoryActions;

