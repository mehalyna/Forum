import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks';

import DropdownMenu from './DropdownMenu';
import css from './Profile.module.css';


function Profile() {
  const { user, isAuth, logout, isStaff } = useAuth();
  const navigate = useNavigate();

  const navigateToProfile = () => {
    navigate(`/profile-detail/${user.profile_id}`);
  };

  const performLogout = async () => {
    if (isAuth) {
      try {
        await axios.post(`${process.env.REACT_APP_BASE_API_URL}/api/auth/token/logout`);
        await logout();
      } catch (error) {
        console.error('Error during logout', error);
      }
    }
  };

  return (
    <div className={css['header-profile-section']}>
      <div className={css['header-profile__avatar']}
           onClick={!isStaff ? navigateToProfile : null}>
        <img
          src={`${process.env.REACT_APP_PUBLIC_URL}/img/Avatar.png`}
          alt="Avatar"
        />
      </div>
      <div className={css['dropdown-section']}>
        <DropdownMenu toggleText={isStaff ? 'Адміністратор' : 'Мій профіль'}>
          {isStaff && (
            <Link to="/customadmin">Адмінпанель</Link>
          )}
            <Link to={isStaff ? '/customadmin/admin-profile/admin-info' : '/profile/user-info'}>Мій профіль</Link>
          {!isStaff && <Link to="/profiles/saved">Мої збережені</Link>}
            <button onClick={performLogout}>Вихід</button>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Profile;
