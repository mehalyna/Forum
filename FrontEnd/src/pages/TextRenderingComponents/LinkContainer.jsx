import { NavLink } from 'react-router-dom';

const LinkContainer = () => {
  const getClassName = ({ isActive }) =>
    isActive ? 'link_text__active' : 'link_text';

  return (
    <div className="link">
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
