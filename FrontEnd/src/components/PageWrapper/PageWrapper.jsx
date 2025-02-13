import { useEffect } from 'react';
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

  useEffect(() => {
    const updatePageContentHeight = () => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');

      const headerHeight = header ? header.offsetHeight : 0;
      const footerHeight = footer ? footer.offsetHeight : 0;

      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    };

    updatePageContentHeight();
    window.addEventListener('resize', updatePageContentHeight);

    return () => {
      window.removeEventListener('resize', updatePageContentHeight);
    };
  }, []);

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
