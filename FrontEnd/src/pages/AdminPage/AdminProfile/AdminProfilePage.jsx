import { NavLink, Route, Routes } from 'react-router-dom';

import { useAuth } from '../../../hooks';

import ChangeAdminPassword from './ChangeAdminPassword';
import AdminInfo from './AdminInfo';

import classes from './AdminProfilePage.module.css';

const ADMIN_PAGE_TABS = [
    {
        title: 'Загальна інформація',
        link: '/admin-info',
    },
    {
        title: 'Змінити пароль',
        link: '/change-password',
    },
];

const AdminProfilePage = () => {

    const { user, mutate } = useAuth();

    return (
        <div className={classes['admin-profile__page']}>
            <div className={classes['admin-profile__menu-section']}>
                <p className={classes['admin-profile__menu-section--title']}>Профіль адміністратора</p>
                <div className={classes['admin-profile__links']}>
                    {ADMIN_PAGE_TABS.map((element) => (
                        <NavLink
                            className={({ isActive }) => (`${classes['infolink']} ${isActive && classes['infolink__active']}`)}
                            to={`/customadmin/admin-profile${element.link}`}
                            key={element.title}
                        >
                            {element.title}
                        </NavLink>
                    ))}
                </div>
            </div>
            <Routes>
                <Route
                    path="admin-info"
                    element={<AdminInfo user={user} mutate={mutate} />} />
                <Route
                    path="change-password"
                    element={<ChangeAdminPassword user={user}/>} />
            </Routes>
        </div>
    );
};

export default AdminProfilePage;