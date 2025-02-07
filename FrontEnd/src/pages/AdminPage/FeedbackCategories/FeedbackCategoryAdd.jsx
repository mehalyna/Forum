import { useState } from 'react';
import { Button, Input } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import PropTypes from 'prop-types';

import validateFeedbackCategory from '../../../utils/validateFeedbackCategory';

import styles from './FeedbackCategoryAdd.module.css';

function FeedbackCategoryAdd({ onActionComplete }) {
    const [feedbackCategoryName, setFeedbackCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const handleFeedbackCategoryAdd = async () => {
        if (isAdding) return;

        const isValid = validateFeedbackCategory(feedbackCategoryName, setError);
        if (!isValid) return;

        setIsAdding(true);

        try {
            await axios.post(
                `${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories/`,
                { name: feedbackCategoryName.trim() }
            );
            toast.success('Успішно створено');
            setFeedbackCategoryName('');
            if (onActionComplete) onActionComplete();
        } catch (error) {
            if (error.response && error.response.data.name) {
                const errorMessage = error.response.data.name[0];
                setError(
                    errorMessage === 'A category with this name already exists.'
                        ? 'Категорія з такою назвою вже існує.'
                        : errorMessage
                );
            } else {
                toast.error('Не вдалося створити категорію.');
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={styles.feedbackCategoryAddContainer}>
            <h3 className={styles.feedbackCategoryAddTitle}>Додати нову категорію</h3>
            <Input
                type="text"
                placeholder="Введіть назву категорії"
                value={feedbackCategoryName}
                onChange={(e) => {
                    setFeedbackCategoryName(e.target.value);
                    validateFeedbackCategory(e.target.value, setError);
                }}
                className={styles.feedbackCategoryAddInput}
            />
            {error && <p className={styles.feedbackCategoryAddError}>{error}</p>}
            <div className={styles.feedbackCategoryAddButtonsBlock}>
                <Button type="primary" loading={isAdding} onClick={handleFeedbackCategoryAdd}>
                    Зберегти
                </Button>
                <Button
                    onClick={() => {
                        setError('');
                        setFeedbackCategoryName('');
                    }}
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
