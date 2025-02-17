import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import css from './Contacts.module.css';
import { useMask } from '@react-input/mask';

const fetcher = (url) => axios.get(url).then((res) => res.data);

const errorTranslation = {
    'Enter a valid email address.': 'Введіть коректний email.',
    'Phone number must be exactly 12 characters long.': 'Номер телефону має містити рівно 12 цифр.',
    'Phone number must contain only numbers.': 'Номер телефону має містити лише цифри.',
    'Address must contain only alphanumeric characters and valid symbols (e.g., commas, periods).':
        'Адреса має містити тільки букви, цифри та допустимі символи (, .).',
    'Company name contains invalid characters. Only Ukrainian and Latin letters, numbers, and specific symbols are allowed.':
        'Назва компанії містить недопустимі символи. Дозволені лише українські та латинські літери, цифри та деякі символи.'
};

const Contacts = () => {
    const { data: contacts, error, isLoading } = useSWR(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`, fetcher);
    const [formData, setFormData] = useState(contacts || {});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const phoneMaskRef = useMask({ mask: '380XXXXXXXXX', replacement: { X: /\d/ } });

    useEffect(() => {
        if (contacts) {
            setFormData(contacts);
        }
    }, [contacts]);

    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                return /\S+@\S+\.\S+/.test(value) ? '' : 'Введіть коректний email.';
            case 'phone':
                return /^\d{12}$/.test(value) ? '' : 'Номер телефону має містити рівно 12 цифр.';
            case 'company_name':
                return /^[а-яА-ЯіІїЇєЄґҐa-zA-Z0-9\s'"`.,-]*$/.test(value) ? '' : 'Назва компанії містить недопустимі символи.';
            case 'address':
                return value.trim() !== '' ? '' : 'Адреса не може бути порожньою.';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        const error = validateField(name, value);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`, formData);
            if (response.status === 200) {
                mutate();
                toast.success('Зміни успішно збережені! ✅');
            } else {
                throw new Error('Помилка оновлення контактів');
            }
        } catch (error) {
            console.error('Помилка при оновленні контактів:', error);
            if (error.response && error.response.data) {
                const translatedErrors = Object.keys(error.response.data).reduce((acc, key) => {
                    acc[key] = error.response.data[key].map((msg) => errorTranslation[msg] || msg);
                    return acc;
                }, {});
                setErrors(translatedErrors);
            } else {
                setErrors({ general: 'Не вдалося зберегти зміни.' });
            }
            toast.error('Помилка! Не вдалося зберегти зміни ❌');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className={css['loading']}>Завантаження...</div>;
    if (error) return <div className={css['error']}>Не вдалося завантажити контактну інформацію.</div>;

    return (
        <div className={css['contacts-container']}>
            <h2 className={css['contacts-title']}>Редагування контактної інформації</h2>
            <form onSubmit={handleSubmit} className={css['contacts-form']}>
                <div className={css['form-row']}>
                    <label className={css['form-label']}>
                        Назва компанії:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="company_name"
                            value={formData.company_name || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.company_name && <p className={css['error-message']}>{errors.company_name}</p>}
                    </label>
                    <label className={css['form-label']}>
                        Адреса:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.address && <p className={css['error-message']}>{errors.address}</p>}
                    </label>
                </div>
                <div className={css['form-row']}>
                    <label className={css['form-label']}>
                        Email:
                        <input
                            className={css['form-input']}
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.email && <p className={css['error-message']}>{errors.email}</p>}
                    </label>
                    <label className={css['form-label']}>
                        Телефон:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="phone"
                            ref={phoneMaskRef}
                            placeholder="380XXXXXXXXX"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.phone && <p className={css['error-message']}>{errors.phone}</p>}
                    </label>
                </div>
                <div className={css['form-buttons']}>
                    <button type="submit" className={css['save-button']} disabled={isSubmitting}>
                        {isSubmitting ? 'Збереження...' : 'Зберегти'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contacts;