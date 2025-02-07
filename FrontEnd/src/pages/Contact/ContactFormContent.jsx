import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import useSWR from 'swr';
import { Select, Space } from 'antd';

import {
    EMAIL_PATTERN,
    MESSAGE_PATTERN
} from '../../constants/constants';

import MyModal from '../../pages/ProfilePage/UI/MyModal/MyModal';
import styles from './ContactFormContent.module.css';

const fetcher = async (url) => {
    const response = await axios.get(url);
    return response.data;
};

export function ContactFormContent({ onLoading }) {
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        mode: 'all',
        defaultValues: {
            message: '',
            email: '',
            category: 'Інше',
        },
    });

    const { data } = useSWR(`${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback-categories/`, fetcher);
    const categories = data?.results?.length
        ? data.results.map(cat => ({ value: cat.name, label: cat.name }))
        : [{ value: 'Інше', label: 'Інше' }];

    const onSubmit = async (value) => {
        onLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_BASE_API_URL}/api/admin/feedback/`, {
                email: value.email,
                message: value.message,
                category: value.category,
            });

            setModalMessage('Повідомлення успішно надіслано!');
            setModal(true);
            reset();
        } catch {
            setModalMessage('Щось пішло не так! Будь ласка, спробуйте ще раз!');
            setModal(true);
        } finally {
            onLoading(false);
        }
    };

    const closeModal = () => {
        setModalMessage('');
        setModal(false);
    };

    return (
        <div className={styles['contact-form']}>
            <div className={styles['contact-form__label']}>
                <label className={styles['contact-form__label--required']}>*</label>
                <label className={styles['contact-form__label--text']}>
                    Обов&apos;язкові поля позначені зірочкою
                </label>
            </div>
            <form
                id="contactForm"
                className={styles['contact-form__container']}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <div className={styles['contact__field']}>
                    <div className={styles['contact-form__label']}>
                        <label className={styles['contact-form__label--required']}>*</label>
                        <label className={styles['contact-form__label--text']}>
                            Електронна пошта:
                        </label>
                    </div>
                    <div className={styles['contact-form__field']}>
                        <input className={styles['contact__input']}
                            id="email"
                            type="email"
                            placeholder="Введіть свою електронну пошту"
                            {...register('email', {
                                required: 'Обов’язкове поле',
                                pattern: {
                                    value: EMAIL_PATTERN,
                                    message: 'Електронна пошта не відповідає вимогам',
                                }
                            })}
                        />
                    </div>
                    <div className={styles['contact-form__error']}>
                        {errors.email && errors.email.message}
                    </div>
                </div>

                <div className={styles['contact__field']}>
                    <div className={styles['contact-form__label']}>
                        <label className={styles['contact-form__label--text']}>Категорія:</label>
                    </div>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Space direction="vertical" style={{ width: '100%', gap: '0px' }}>
                                <Select
                                    placeholder="Оберіть"
                                    {...field}
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ width: 257, borderRadius: '2px' }}
                                    variant="borderless"
                                    className={styles['contact__select']}
                                    options={categories}
                                    onChange={(value) => field.onChange(value)}
                                    defaultValue="Інше"
                                />
                            </Space>
                        )}
                    />
                </div>

                <div className={`${styles['contact__field']}`}>
                    <div className={styles['contact-form__label']}>
                        <label className={styles['contact-form__label--required']}>*</label>
                        <label className={styles['contact-form__label--text']}>
                            Повідомлення:
                        </label>
                    </div>
                    <div className={styles['contact-form__field']}>
                        <textarea
                            id="message"
                            className={styles['contact__textarea']}
                            placeholder="Введіть ваше повідомлення"
                            {...register('message', {
                                required: 'Обов’язкове поле',
                                pattern: {
                                    value: MESSAGE_PATTERN,
                                    message: 'Повідомлення не може бути коротшим за 10 символів',
                                }
                            })}
                            spellCheck={false}
                        />
                    </div>
                    <div className={styles['contact-form__error']}>
                        {errors.message && errors.message.message}
                    </div>
                </div>
            </form>
            <MyModal visible={modal}>
                <div className={styles['modal_feedback_content']}>
                    <button
                        className={styles['modal_feedback_close']}
                        onClick={closeModal}
                        aria-label="Закрити модальне вікно"
                    >
                        <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cross-btn.svg`} alt="Close button" />
                    </button>
                    <h2 className={styles['modal_feedback__title']}>{modalMessage}</h2>
                    <h2 className={styles['modal_feedback__info']}>Ваше повідомлення буде опрацьовано</h2>
                    <div className={styles['contact__button_modal_container']}>
                        <Link to="/">
                            <button type="button" className={styles['contact__button_send']}>
                                На головну
                            </button>
                        </Link>
                    </div>
                </div>
            </MyModal>
        </div>
    );
}
