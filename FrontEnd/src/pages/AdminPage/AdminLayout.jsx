import { NavLink } from 'react-router-dom';
import Menu from './Menu/Menu';
import css from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    return (
      <div className={css['admin-layout__wrapper']}>
        <div className={css['admin-layout']}>
            <NavLink className={css['admin-layout__title']} to={'/customadmin/'}>
                <h2 className={css['admin-layout__title--text']}>Панель адміністратора</h2>
            </NavLink>
            <div className={css['admin-layout__content']}>
                <Menu />
                <div className={css['admin-layout__children-section']}>{children}</div>
            </div>
        </div>
      </div>
    );
  };

  export default AdminLayout;