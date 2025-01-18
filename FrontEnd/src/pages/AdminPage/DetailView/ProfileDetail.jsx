import {useState} from 'react';
import axios from 'axios';
import useSWR from 'swr';
import {Descriptions, Tag, Badge} from 'antd';
import css from './ProfileDetail.module.css';

function ProfileDetail() {
    const [profile, setProfile] = useState({});
    const profileId = usePathCompanyId();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/profiles/${profileId}/`;
    const items = [
        {
            key: '1',
            label: 'Ім\'я',
            children: profile.name
        },
        {
            key: '2',
            label: 'Позиція',
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
                        <Tag className={css['tag']} color="cyan" key={activity}>{activity}</Tag>
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
                        <Tag className={css['tag']} color="blue" key={category}>{category}</Tag>
                    ))
                    : ''
            )
        },
        {
            key: '7',
            label: 'Телефон',
            children: profile.phone
        },
        ...(profile.edrpou
            ? [{
                key: '8',
                label: 'ЕРДПО',
                children: profile.edrpou
            }]
            : [
                {
                    key: '8',
                    label: 'РНОКПП',
                    children: profile.rnokpp
                }
            ]),
        ...(profile.is_startup && profile.is_registered
            ? [
                {
                    key: '8',
                    label: 'Інформація про послуги',
                    children: profile.service_info
                },
                {
                    key: '8',
                    label: 'Інформація про товари',
                    children: profile.product_info
                },
                {
                    key: '8',
                    label: 'Ідея стартапу',
                    children: profile.startup_idea
                },
                {
                    key: '8',
                    label: 'Рік заснування',
                    children: profile.founded
                }
            ]
            : profile.is_registered
                ? [
                    {
                        key: '8',
                        label: 'Інформація про послуги',
                        children: profile.service_info
                    },
                    {
                        key: '8',
                        label: 'Інформація про товари',
                        children: profile.product_info
                    },
                    {
                        key: '8',
                        label: 'Рік заснування',
                        children: profile.founded
                    }
                ]
                : profile.is_startup
                    ? [{
                        key: '8',
                        label: 'Ідея стартапу',
                        children: profile.startup_idea
                    }]
                    : []),
        {
            key: '9',
            label: 'Адреса',
            children: profile.address,
        },
        {
            key: '10',
            label: 'Чи заблокованний профіль?',
            children: (
                <Badge
                    status={profile.status === 'blocked' ? 'error' : 'success'}
                    text={profile.status === 'blocked' ? 'Заблокованний' : 'Активний'}
                />
            ),
            span: 2
        },
        {
            key: '11',
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
            key: '12',
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
        },
    ];
    const fetcher = url => axios.get(url).then(res => res.data);
    const {data, error, isValidating: loading} = useSWR(url, fetcher);
    if (data && !Object.keys(profile).length) {
        setProfile(data);
    }
    return (
        <div className={css['profile-detail-page']}>
            <div className={css['profile-details-section']}>
                <ul className={css['log-section']}>
                    {loading && <li className={css['log']}>Завантаження ...</li>}
                    {error && <li className={css['log']}>Виникла помилка: {error}</li>}
                </ul>
                <Descriptions title="Детальна інформація профілю" bordered items={items} column={2}/>
            </div>
        </div>
    );

}

function usePathCompanyId() {
    const pathname = window.location.pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
}

export default ProfileDetail;
