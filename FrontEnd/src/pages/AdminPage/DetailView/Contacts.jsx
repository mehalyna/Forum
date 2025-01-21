import React, { useState, useEffect } from 'react';
import axios from 'axios';
import css from'./Contacts.module.css';

const LoadingMessage = () => <div className="loading">Завантаження...</div>;

const Contacts = () => {
    const [contacts, setContacts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`);
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                setError('Не вдалося завантажити контактну інформацію.');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

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
        setError(null);

        try {
            await axios.put(`${process.env.REACT_APP_BASE_API_URL}/api/admin/contacts/`, contacts);
            setSuccess(true);
        } catch (error) {
            console.error('Error updating contacts:', error);
            setError('Не вдалося зберегти зміни.');
        }
    };

    if (loading) return <LoadingMessage />;
    if (error && !contacts) return <div className={css['error']}>{error}</div>;

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
                    </label>
                    <label className={css['form-label']}>
                        Телефон:
                        <input
                            className={css['form-input']}
                            type="text"
                            name="phone"
                            value={contacts?.phone || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                </div>
                <div className={css['form-buttons']}>
                    <button type="submit" className={css['save-button']}>Зберегти</button>
                </div>
            </form>
            {success && <p className={css['success-message']}>Зміни успішно збережені!</p>}
            {error && <p className={css['error-message']}>{error}</p>}
        </div>
    );
};

export default Contacts;
