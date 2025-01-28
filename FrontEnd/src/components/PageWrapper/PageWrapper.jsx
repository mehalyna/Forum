import PropTypes from 'prop-types';
import { useBurgerMenu } from '../../context/BurgerMenuContext';
import { useCookieContext } from '../../context/CookieContext';
import useScrollToHash from '../../hooks/useScrollToHash';
import CookieMod from '../CookieAcception/CookieMod';
import css from './PageWrapper.module.css';

const PageWrapper = ({ children }) => {
  const { isOpen } = useBurgerMenu();
  const { isCookieModalActive } = useCookieContext();

  useScrollToHash();

  return (
    <div className={`${css.pageContent} ${isOpen ? css.menuOpen : ''}`}>
      {isCookieModalActive && <CookieMod />}
      {children}
    </div>
  );
};

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageWrapper;
