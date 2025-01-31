import { useState } from 'react';
import { Button, Input } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PropTypes from 'prop-types';

import ValidateFeedbackCategory from './ValidateFeedbackCategory';

import styles from './FeedbackCategoryAdd.module.css';

function FeedbackCategoryAdd({ onActionComplete }) {
    const [feedbackCategoryName, setFeedbackCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const handleFeedbackCategoryAdd = async () => {
        if (isAdding) return;

        setIsAdding(true);
        const isValid = await ValidateFeedbackCategory(feedbackCategoryName, setError);
        if (!isValid) {
            setIsAdding(false);
            return;
        }

        try {
            await axios.post(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories/`,
                { name: feedbackCategoryName.trim() }
            );
            toast.success('Категорія успішно створена');
            setFeedbackCategoryName('');
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error('Не вдалося створити категорію.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={styles.feedbackCategoryAddContainer}>
            <h3 className={styles.feedbackCategoryAddTitle}>Додати нову категорію фідбеків</h3>
            <Input.TextArea
                rows={1}
                placeholder="Введіть назву категорії"
                value={feedbackCategoryName}
                onChange={(e) => {
                    setFeedbackCategoryName(e.target.value);
                    setError('');
                }}
                className={styles.feedbackCategoryAddTextarea}
            />
            {error && <p className={styles.feedbackCategoryAddError}>{error}</p>}
            <div className={styles.feedbackCategoryAddButtonsBlock}>
                <Button
                    type="primary"
                    loading={isAdding}
                    onClick={handleFeedbackCategoryAdd}
                    className={styles.feedbackCategoryAddButton}
                >
                    Зберегти
                </Button>
                <Button
                    onClick={() => {
                        setError('');
                        setFeedbackCategoryName('');
                    }}
                    className={styles.feedbackCategoryAddButton}
                >
                    Скасувати
                </Button>
            </div>
        </div>
    );
}

FeedbackCategoryAdd.propTypes = {
    onActionComplete: PropTypes.func,
};

export default FeedbackCategoryAdd;
