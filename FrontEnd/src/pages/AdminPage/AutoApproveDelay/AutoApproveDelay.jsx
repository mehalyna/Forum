import { useState } from 'react';
import { toast } from 'react-toastify';
import { Tooltip, InputNumber } from 'antd';
import useSWR from 'swr';
import axios from 'axios';
import css from './AutoApproveDelay.module.css';

const AutoApproveDelay = () => {
    const fetcher = url => axios.get(url).then(res => res.data).catch((e) => {
        if (!e.response || e.response.status !== 401) {
            toast.error('Помилка зв`язку із сервером.');
        }
    });
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/automoderation/`;
    const [delay, setDelay] = useState('');
    const [error, setError] = useState(null);
    const { data, mutate } = useSWR(url, fetcher,
        { onSuccess: (data) => setDelay(data.auto_moderation_hours) });

    const handleInputChange = (value) => {
        setError(null);
        setDelay(value);
        if (!(1 <= value && value <= 48) || !Number.isInteger(value)) {
            setError('Кількість годин має бути в діапазоні 1-48 години');
        }
    };

    const handleCancel = () => {
        setDelay(data?.auto_moderation_hours);
        setError(null);
    };

    const handleSubmit = () => {
        !error && axios.put(`${process.env.REACT_APP_BASE_API_URL}/api/admin/automoderation/`, { 'auto_moderation_hours': delay })
            .then(() => { toast.success('Зміни успішно застосовано.'); mutate({ ...data, auto_moderation_hours: delay }); })
            .catch(() => toast.error('Не вдалося зберегти зміни, сталася помилка'));
    };
    return (
        <div className={css['autoapprove-section']}>
            <p className={css['autoapprove-section__head']}>Налаштуйте час, після якого зміни будуть автоматично затверджені у разі відсутності дій з боку модератора.</p>
            <label htmlFor="autoapprove" className={css['autoapprove_label']}>Час до автоматичного затвердження <br />
            (години)</label>
            <Tooltip
                title={'Введіть значення 1-48'}
                placement="top"
                pointAtCenter={true}>
                <InputNumber
                    id="autoapprove"
                    className={css['autoapprove-input']}
                    min={1} max={48}
                    onChange={handleInputChange}
                    value={delay}
                />
            </Tooltip>
            {error &&
                <p className={css['error-message']}>{error}</p>}
            <div className={css['buttons-group']}>
                <button className={css['button']} onClick={handleSubmit}>Змінити</button>
                <button className={`${css['button']} ${css['cancel-button']}`} onClick={handleCancel}>Скасувати</button>
            </div>
        </div>
    );

};

export default AutoApproveDelay;