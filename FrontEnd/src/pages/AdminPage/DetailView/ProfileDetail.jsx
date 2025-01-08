import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import {Descriptions, Input, Switch, Tag} from 'antd';
import DeleteModal from './DeleteModal';
import css from './ProfileDetail.module.css';

function ProfileDetail() {
    const [deleteModalActive, setDeleteModalActive] = useState(false);
    const [profile, setProfile] = useState({});
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const profileId = usePathCompanyId();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/profiles/${profileId}/`;
    const navigateToProfiles = (path) => {
        window.location.href = path;
    };
    const items =[
        {
            key: '1',
            label: 'Ім\'я',
            children: (
                <Input
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
            )
        },
        {
            key: '2',
            label: 'Позиція:',
            children: profile.person_position
        },
        {
            key: '3',
            label: 'Офіційна назва',
            children: profile.official_name
        },
        {
            key: '4',
            label: 'Регіон',
            children: (Array.isArray(profile.regions)
                ? profile.regions.map(region => region.name_ukr).join(', ') : null)
        },
        {
            key: '5',
            label: 'Активності',
            children: (
                Array.isArray(profile.activities)
                ? profile.activities.map(activity => (
                    <Tag color="cyan" key={activity}>{activity}</Tag>
                  ))
                : ''
            )
        },
        {
            key: '6',
            label: 'Категорії',
            children: (
                Array.isArray(profile.categories)
                ? profile.categories.map(category => (
                    <Tag color="blue" key={category}>{category}</Tag>
                  ))
                : ''
            )
    },
        {
            key: '7',
            label: 'Телефон',
            children: profile.phone
        },
        {
            key: '8',
            label: 'ЕРДПО',
            children: profile.edrpou
        },
        {
            key: '9',
            label: 'Адреса',
            children: profile.address,
        },
        {
            key: '10',
            label: 'Видаленний',
            children: (
                <Switch
                    checked={profile.is_deleted || false}
                    onChange={(checked) => setProfile({ ...profile, is_deleted: checked })}
                />
            ),
            span: 2
        },
        {
            key: '11',
            label: 'Видалити профіль',
            children: (
                <button className={css['button__delete']} onClick={() => setDeleteModalActive(true)}>Видалити</button>
            ),
            span: 2

        },
        {
            key: '12',
            label: 'Логотип',
            children: (
                profile.logo_image ? (
                    <img
                        src={profile.logo_image}
                        alt="logo" width={200}
                        height={200}
                        className={css['logo-image']}/>
                ) : ''
            ),
            span: 2
        },
        {
            key: '13',
            label: 'Банер',
            children: (
                profile.banner_image ? (
                    <img
                        src={profile.banner_image}
                        alt="banner" width={400}
                        height={250}
                        className={css['banner-image']}/>
                ) : ''
            ),
            span: 2
        }
    ];
    const fetcher = url => axios.get(url).then(res => res.data);
    const { data, error, isValidating: loading } = useSWR(url, fetcher);
    if (data && !Object.keys(profile).length) {
        setProfile(data);
    }
    console.log(data);
    const handleSaveChanges = async () => {
        const response = await axios.put(
            url,
            {
                name: profile.name,
                is_deleted: profile.is_deleted,
            },
        );
        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
    };

    const handleDeleteUser = async () => {
        const response = await axios.delete(url);
        if (response.status !== 204) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setProfile({});
        navigateToProfiles('/customadmin/profiles');
    };

    return (
        <div className={css['profile-detail-page']}>
            <DeleteModal
                active={deleteModalActive}
                setActive={setDeleteModalActive}
                onDelete={handleDeleteUser}
            />
            <div className={css['profile-details-section']}>
                <ul className={css['log-section']}>
                    {loading && <li className={css['log']} >Завантаження ...</li>}
                    {error && <li className={css['log']}>Виникла помилка: {error}</li>}
                    {updateSuccess && <li className={css['log']}>Профіль успішно оновлений!</li>}
                </ul>
                <Descriptions title="Profile information" bordered items={items} column={2}/>
                <button className={css['save-button']} onClick={handleSaveChanges}>Зберегти зміни</button>
            </div>
        </div>
    );
}

function usePathCompanyId() {
    const pathname = window.location.pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
}
export default ProfileDetail;
