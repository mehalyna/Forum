import Hamburger from 'hamburger-react';
import Menu from './Menu';
import SearchBox from './SearchBox';
import { useBurgerMenu } from '../../../context/BurgerMenuContext';
import css from './BurgerMenu.module.css';

const BurgerMenu = () => {
  const { isOpen, toggleMenu, menuRef } = useBurgerMenu();

  return (
    <div className={css.burgerMenuContainer} ref={menuRef}>
      <Hamburger toggled={isOpen} toggle={toggleMenu} size={30} className={css.hamburgerIcon} />
      <div className={`${css.menu} ${isOpen ? css.open : ''}`}>
        {isOpen && (
          <>
            <SearchBox className={css.searchBar} />
            <Menu />
          </>
        )}
      </div>
    </div>
  );
};

export default BurgerMenu;
