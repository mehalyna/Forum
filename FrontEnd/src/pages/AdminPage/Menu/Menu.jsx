import { NavLink } from 'react-router-dom';
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
        id: 'am6',
        title: 'Пошта адміністратора',
        link: '/customadmin/email/'
    },
    {
        id: 'am7',
        title: 'Реєстрація адміністратора',
        link: '/customadmin/admin-create/'
    }

];

function Menu() {
    const { isSuperUser } = useAuth();

    return (
        <div className={css['menu-section']}>
            {[
                ...MENU,
                ...(isSuperUser ? SUPERUSER_MENU : [])
            ].map((element) => (
                <NavLink
                    className={({ isActive }) => (`${css['menu-section-element']} ${isActive && css['menu-section-element__active']}`)}
                    key={element.id} to={element.link}>{element.title}
                </NavLink>
            ))}
        </div>
    );
}

export default Menu;
