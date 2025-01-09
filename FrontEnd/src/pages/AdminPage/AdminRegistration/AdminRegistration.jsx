import axios from 'axios';
import { toast } from 'react-toastify';
import { Tooltip, Input } from 'antd';
import { useState } from 'react';
import { EMAIL_PATTERN } from '../../../constants/constants';
import css from './AdminRegistration.module.css';

const AdminRegistration = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setEmail(e.target.value);
    };

    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/admin_create/`;

    const handleSubmit = () => {
        EMAIL_PATTERN.test(email) ?
            axios.post(url, { email: email })
                .then(() => {
                    toast.success('Пароль надіслано на електронну адресу');
                })
                .catch((err) => {
                    if (err.response.data.email) {
                        toast.error('Ця електронна пошта вже використовується');
                    } else {
                        toast.error('Виникла помилка');
                    }
                })
                .finally(() => {
                    setError(null);
                })
            :
            setError('Будь ласка, введіть дійсну електронну адресу');
    };

    const handleCancel = () => {
        setEmail('');
    };

    return (
        <div className={css['admin_registration-section']}>
            <div className={css['admin_registration-outer-wrapper']}>
                <p className={css['admin_registration-section__head']}>Зареєструйте користувача, який буде виконувати функції адміністратора сайту.
                    <br/>На вказану електронну адресу буде надіслано згенерований для користувача пароль.
                </p>
                <label className={css['admin_registration-label']} htmlFor="newAdminEmail">
                    <span className={css['admin_registration-asterisk']} >*</span>
                    Електронна адреса
                </label>
                <div className={css['admin_registration-input-wrapper']}>
                    <Tooltip
                        title={'Введіть тут електронну пошту особи, яку потрібно зареєструвати в якості адміністратора'}
                        placement="top">
                        <Input className={css['admin_registration-input']}
                            id="newAdminEmail"
                            onChange={handleInputChange}
                            type="email"
                            placeholder="Введіть електронну пошту"
                            autoComplete="off"
                            value={email}/>
                    </Tooltip>
                    <div className={css['buttons-group']}>
                        <button className={css['admin_registration-button']} onClick={handleSubmit}>Надіслати</button>
                        <button className={`${css['admin_registration-button']} ${css['cancel-button']}`} onClick={handleCancel}>Скасувати</button>
                    </div>
                </div>
                {error && <p className={css['admin_registration-error']} >{error}</p>}
            </div>
        </div>
    );
};

export default AdminRegistration;