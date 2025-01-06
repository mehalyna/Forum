import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import css from './Menu.module.css';

const MENU = [
    {
        id: 'am1',
        title: 'Керування користувачами',
        link: '/customadmin/users/'
    },
    {
        id: 'am2',
        title: 'Керування компаніями',
        link: '/customadmin/profiles/'
    },
    {
        id: 'am3',
        title: 'Керування контактами',
        link: '/customadmin/contacts/'
    },
    {
        id: 'am4',
        title: 'Налаштування часу автоапруву',
        link: '/customadmin/automoderation/'
    },
    {
        id: 'am5',
        title: 'Статистика компаній',
        link: '/customadmin/statistics/'
    },
];


const SUPERUSER_MENU = [
    {
        id: 'am5',
        title: 'Пошта адміністратора',
        link: '/customadmin/email/'
    },
    {
        id: 'am6',
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
                        key={element.id} to={element.link}>{element.title}
                    </NavLink>
                ))}
            </div>
        ) : null
    );
}

export default Menu;
