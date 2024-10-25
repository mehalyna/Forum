import { Link } from 'react-router-dom';

import { useAuth } from '../../../hooks';

import Menu from './Menu';
import SearchBox from './SearchBox';
import Profile from './Profile';
import Buttons from './Buttons';

import css from './Navbar.module.css';

function Navbar (props) {
  const { isStaff} = useAuth();
  return (
    <div className={css['navbar-wrapper']}>
      <div className={css['navbar-content']}>
        <div className={css['navbar-logo__text']}>
          <Link to="/" target={isStaff ? '_blank' : null}>
            <div className={css['navbar-main-logo']}>
              <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/craftMerge-logo.svg`}
                  alt="CraftMerge logo"
              ></img>
              <span>CRAFTMERGE</span>
            </div>
          </Link>
        </div>
        <div className={css['navbar-utility-bar']}>
          <>
            <Menu/>
            <SearchBox></SearchBox>
          </>
          {props.isAuthorized === true ? <Profile /> : <Buttons adminPage={props.page.includes('/customadmin')} />}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
