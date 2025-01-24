import { useParams } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import { Descriptions, Tag, Badge } from 'antd';
import Loader from '../../../components/Loader/Loader'
import css from './ProfileDetail.module.css';

function ProfileDetail() {
    const { id } = useParams();
    const url = `${process.env.REACT_APP_BASE_API_URL}/api/admin/profiles/${id}/`;
    const fetcher = url => axios.get(url).then(res => res.data);
    const {data: profile, error, isLoading } = useSWR(url, fetcher, {revalidateOnFocus: false});

    const getStartupOrRegisteredFields = () => {
        let fields = [];
        if(profile.is_registered && profile.is_startup) {
            fields.push(
                {
                    key: '10',
                    label: 'Інформація про послуги',
                    children: profile.service_info
                },
                {
                    key: '11',
                    label: 'Інформація про товари',
                    children: profile.product_info
                },
                {
                    key: '12',
                    label: 'Ідея стартапу',
                    children: profile.startup_idea
                },
                {
                    key: '13',
                    label: 'Рік заснування',
                    children: profile.founded
                }
            );
        } else if (profile.is_registered) {
            fields.push(
                {
                    key: '14',
                    label: 'Інформація про послуги',
                    children: profile.service_info
                },
                {
                    key: '15',
                    label: 'Інформація про товари',
                    children: profile.product_info
                },
                {
                    key: '16',
                    label: 'Рік заснування',
                    children: profile.founded
                }
            );
        } else if (profile.is_startup) {
            fields.push(
                {
                    key: '17',
                    label: 'Ідея стартапу',
                    children: profile.startup_idea
                }
            );
        }
        return fields;
    };

    const items = profile ? [
        {
            key: '1',
            label: 'Ім\'я',
            children: profile.name
        },
        {
            key: '2',
            label: 'Посада представника',
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
            children: profile.regions_ukr_display
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
        {
            key: '8',
            label: profile.is_fop ? 'РНОКПП' : 'ЄДРПОУ',
            children: profile.is_fop ? profile.rnokpp : profile.edrpou
        },
        ...getStartupOrRegisteredFields(),
        {
            key: '18',
            label: 'Адреса',
            children: profile.address,
        },
        {
            key: '19',
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
            key: '20',
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
            key: '21',
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
    ] : [];

    return (
        (error && error.status !== 401
        ) ? (
            <div className={css['log']}>Виникла помилка: {error.message}</div>
        ) : (
            isLoading ? <Loader /> :
            <div className={css['profile-detail-page']}>
                <div className={css['profile-details-section']}>
                    <Descriptions title="Детальна інформація профілю" bordered items={items} column={2}/>
                </div>
            </div>
        )
    );
}

export default ProfileDetail;
