import React, { useState, useEffect } from 'react';
import axios from 'axios';
import css from './Contacts.module.css';
import { useMask } from '@react-input/mask';

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
    const [contacts, setContacts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`);
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                setError({ general: 'Не вдалося завантажити контактну інформацію.' });
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const phoneMaskRef = useMask({ mask: '380XXXXXXXXX', replacement: { X: /\d/ } });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContacts((prevContacts) => ({
            ...prevContacts,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        setError({});

        try {
            await axios.put(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`, contacts);
            setSuccess(true);
        } catch (error) {
            console.error('Error updating contacts:', error);
            if (error.response && error.response.data) {
                const translatedErrors = Object.keys(error.response.data).reduce((acc, key) => {
                    acc[key] = error.response.data[key].map(msg => errorTranslation[msg] || msg);
                    return acc;
                }, {});
                setError(translatedErrors);
            } else {
                setError({ general: 'Не вдалося зберегти зміни.' });
            }
        }
    };

    if (loading) return <div className={css['loading']}>Завантаження...</div>;
    if (error.general) return <div className={css['error']}>{error.general}</div>;

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
                            value={contacts?.company_name || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {error.company_name && <p className={css['error-message']}>{error.company_name}</p>}
                    </label>
                    <label className={css['form-label']}>
                        Адреса:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="address"
                            value={contacts?.address || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {error.address && <p className={css['error-message']}>{error.address}</p>}
                    </label>
                </div>
                <div className={css['form-row']}>
                    <label className={css['form-label']}>
                        Email:
                        <input
                            className={css['form-input']}
                            type="email"
                            name="email"
                            value={contacts?.email || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {error.email && <p className={css['error-message']}>{error.email}</p>}
                    </label>
                    <label className={css['form-label']}>
                        Телефон:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="phone"
                            ref={phoneMaskRef}
                            placeholder="380XXXXXXXXX"
                            value={contacts?.phone || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {error.phone && <p className={css['error-message']}>{error.phone}</p>}
                    </label>
                </div>
                <div className={css['form-buttons']}>
                    <button type="submit" className={css['save-button']}>Зберегти</button>
                </div>
            </form>
            {success && <p className={css['success-message']}>Зміни успішно збережені!</p>}
        </div>
    );
};

export default Contacts;
