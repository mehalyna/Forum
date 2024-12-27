import { NavLink } from 'react-router-dom';

const LinkContainer = () => {
  const getClassName = ({ isActive }) =>
    isActive ? styles['link_text__active'] : styles['link_text'];

  return (
    <div className={styles['link']}>
      <NavLink to="/privacy-policy/" className={getClassName}>
        Політика конфіденційності
      </NavLink>
      <NavLink to="/terms-and-conditions/" className={getClassName}>
        Умови користування
      </NavLink>
      <NavLink to="/contact/" className={getClassName}>
      Зворотній зв&apos;язок
      </NavLink>
    </div>
  );
};

export default LinkContainer;
