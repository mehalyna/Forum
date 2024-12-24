import { useCookieContext } from '../../context/CookieContext';
import { Link } from 'react-router-dom';
import styles from './CookieMod.module.css';

const CookieMod = () => {
  const { isCookieModalActive, allowCookies, declineCookies } =
    useCookieContext();

  return isCookieModalActive ? (
    <div className={styles['cookie-banner']} data-testid="cookiemodal">
      <div className={styles['cookie-content']}>
        <div className={styles['cookie-header']}>
          <img
            src={`${process.env.REACT_APP_PUBLIC_URL}/img/cookies.png`}
            alt="cookies"
            className={styles['cookie-logo']}
          />
          <h3 className={styles['cookie-title']}>Cookies</h3>
        </div>
        <p className={styles['cookie-text']}>
          Наш веб-сайт використовує файли cookie, щоб покращити ваш досвід.
        </p>
        <p className={styles['cookie-text']}>
          Дізнатися більше
          <Link to="/privacy-policy" className={styles['cookie-link']}>
            про файли cookie.
          </Link>
        </p>
        <div className={styles['cookie-buttons']}>
          <button className={styles['allow-all-btn']} onClick={allowCookies}>
            Дозволити
          </button>
          <button className={styles['deny-btn']} onClick={declineCookies}>
            Відмовитись
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default CookieMod;
