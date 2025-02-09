import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import css from './Menu.module.css';

const MENU = [
    {
        title: 'Керування користувачами',
        link: '/customadmin/users/'
    },
    {
        title: 'Керування компаніями',
        link: '/customadmin/profiles/'
    },
    {
        title: 'Керування категоріями діяльності',
        link: '/customadmin/categories/'
    },
    {   title: 'Керування категоріями фідбеків',
        link: '/customadmin/feedback-categories/'
    },
    {
        title: 'Керування контактами',
        link: '/customadmin/contacts/'
    },
    {
        title: 'Налаштування часу автоапруву',
        link: '/customadmin/automoderation/'
    },
    {
        title: 'Статистика компаній',
        link: '/customadmin/statistics/'
    },
];


const SUPERUSER_MENU = [
    {
        title: 'Пошта адміністратора',
        link: '/customadmin/email/'
    },
    {
        title: 'Реєстрація адміністратора',
        link: '/customadmin/admin-create/'
    }

];

function Menu() {
    const { isStaff, isAuth, isSuperUser } = useAuth();
    const { pathname } = useLocation();
    const hideMenu = pathname.includes('/admin-profile/');
    const menuItems = [...MENU, ...(isSuperUser ? SUPERUSER_MENU : [])];
    const renderMenu = isStaff && isAuth && !hideMenu;

    return (
        renderMenu ? (
            <div className={css['menu-section']}>
                {menuItems.map((element) => (
                    <NavLink
                        className={({ isActive }) => (`${css['menu-section-element']} ${isActive && css['menu-section-element__active']}`)}
                        key={element.title} to={element.link}>{element.title}
                    </NavLink>
                ))}
            </div>
        ) : null
    );
}

export default Menu;
