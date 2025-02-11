import { useState } from 'react';
import css from './UserDetail.module.css';
import axios from 'axios';
import useSWR from 'swr';
import {Badge, Descriptions} from 'antd';
import Loader from '../../../components/Loader/Loader';

function UserDetail() {
    const [user, setUser] = useState({});
    const userId = usePathUserId();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/users/${userId}/`;
    const fetcher = url => axios.get(url).then(res => res.data);
    const {data, error, isLoading} = useSWR(url, fetcher);
    if (data && !Object.keys(user).length) {
        setUser(data);
    }
    const items = user ? [
        {
            key: '1',
            label: 'Ім\'я',
            children: user.name
        },
        {
            key: '2',
            label: 'Прізвище',
            children: user.surname
        },
        {
            key: '3',
            label: 'Пошта',
            children: user.email
        },
        {
            key: '4',
            label: 'Чи заблокований користувач?',
            children: (
                <Badge
                    status={user.status === 'blocked' ? 'error' : 'success'}
                    text={user.status === 'blocked' ? 'Заблокованний' : 'Активний'}
                />
            ),
            span: 2
        },
        {
            key: '5',
            label: 'Чи користувач робітник?',
            children: (
                <Badge
                    status={user.is_staff === 'True' ? 'error' : 'success'}
                    text={user.is_staff === 'True' ? 'Ні' : 'Так'}
                />
            ),
            span: 2
        },
        {
            key: '5',
            label: 'Чи користувач суперюзер?',
            children: (
                <Badge
                    status={user.is_superuser === 'True' ? 'error' : 'success'}
                    text={user.is_superuser === 'True' ? 'Ні' : 'Так'}
                />
            ),
            span: 2
        },
    ] : [];
    return (
        (error && error.status !== 401
        ) ? (
            <div className={css['log']}>Виникла помилка: {error.message}</div>
        ) : (
            isLoading ? <Loader /> :
            <div className={css['profile-detail-page']}>
                <div className={css['profile-details-section']}>
                    <Descriptions title="Детальна інформація користувача" bordered items={items} column={2}/>
                </div>
            </div>
        )
    );
}
function usePathUserId() {
    const pathname = window.location.pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
}
export default UserDetail;
