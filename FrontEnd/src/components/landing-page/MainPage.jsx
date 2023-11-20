import { useState } from 'react';
import MainBanner from './banner/Banner';
import MainPartners from './partners/Partners';
import MainCompanies from './companies/Companies';
import MainLoginBanner from './login-banner/LoginBanner';
import MainAboutSection from './about-section/About';
import CookieMod from '../cookieacception/CookieMod';
import css from './MainPage.module.css';

const MainPage = (props) => {
  const [modalActive, setModalActive] = useState(true);
  return (
    <div className={css['main-app']}>
      <h1>{process.env.REACT_APP_BASE_API_URL}</h1>
      <h1>{process.env.REACT_APP_PUBLIC_URL}</h1>
      <div className={css['main-app-header']}>
        <MainBanner isAuthorized={props.isAuthorized}/>
        <div className={css['main-app-body']}>
          <MainCompanies />
          <MainPartners />
          {!props.isAuthorized ? <MainLoginBanner /> : null}
          <MainAboutSection />
          <div>
            <CookieMod
              active={modalActive}
              setActive={setModalActive}
            ></CookieMod>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
