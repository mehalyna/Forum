import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Tooltip, Input } from 'antd';
import useSWR from 'swr';
import axios from 'axios';
import css from './ModerationEmail.module.css';

const ModerationEmail = () => {
    const fetcher = url => axios.get(url).then(res => res.data);
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/email/`;
    const { data, mutate } = useSWR(url, fetcher);

    const [email, setEmail] = useState('');

    useEffect(() => {
        if (data && data.email_moderation) {
            setEmail(data.email_moderation);
        }
    }, [data]);

    const handleInputChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = () => {
        axios.patch(`${process.env.REACT_APP_BASE_API_URL}/api/admin/email/`, { 'email_moderation': email })
            .then(() => {
                toast.success('Зміни успішно застосовано.');
                mutate({ ...data, email_moderation: email });
            })
            .catch(() => toast.error('Eлектронна пошта вказана невірно.'));
    };

    const handleCancel = () => {
        setEmail(data?.email_moderation);
    };

    return (
        <div className={css['moderation_email-section']}>
            <Tooltip
                title={'Введіть Email'}
                placement="top"
                pointAtCenter={true}>
                <Input
                    className={css['moderation_email-input']}
                    type="email"
                    onChange={handleInputChange}
                    value={email}
                    placeholder="Введіть email адміністратора"
                />
            </Tooltip>
            <div className={css['buttons-group']}>
                <button className={css['save-button']} onClick={handleSubmit}>Змінити</button>
                <button className={`${css['save-button']} ${css['cancel-button']}`} onClick={handleCancel}>Скасувати</button>
            </div>
        </div>
    );

};

export default ModerationEmail;
