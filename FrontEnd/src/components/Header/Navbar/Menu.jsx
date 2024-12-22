import { Link } from 'react-router-dom';
import css from './Menu.module.css';

const MENU_LINKS = [
  {
    title: 'Про нас',
    link: '/about-us',
  },
  {
    title: 'Підприємства та сектори',
    link: '/profiles',
  },
];

function Menu() {
  return (
    <div className={css['header-menu-section']}>
      {MENU_LINKS.map((element) => (
        <div className={css['header-menu-element']} key={element.link}>
            <Link
              className={css['header-menu-element__text']}
              to={element.link}
            >
              {element.title}
            </Link>
        </div>
      ))}
    </div>
  );
}

export default Menu;
