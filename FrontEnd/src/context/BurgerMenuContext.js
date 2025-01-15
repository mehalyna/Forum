import { createContext, useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

const BurgerMenuContext = createContext();

export const BurgerMenuProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const menuRef = useRef(null);

  const toggleMenu = (state = !isOpen) => setIsOpen(state);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <BurgerMenuContext.Provider value={{ isOpen, toggleMenu, menuRef }}>
      {children}
    </BurgerMenuContext.Provider>
  );
};

BurgerMenuProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useBurgerMenu = () => useContext(BurgerMenuContext);
