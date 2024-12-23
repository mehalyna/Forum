import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import styles from './CookieMod.module.css';

const CookieMod = ({ active, setActive }) => {
  const [cookies, setCookie] = useCookies(['cookies']);

  const shouldShowModal = cookies.cookies === undefined;

  const allowCookies = () => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setCookie('cookies', true, { expires: expirationDate, sameSite: 'lax' });
    setActive(false);
  };

  const declineCookies = () => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setCookie('cookies', false, { expires: expirationDate, sameSite: 'lax' });
    setActive(false);
  };
  return shouldShowModal && active ? (
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

CookieMod.propTypes = {
  active: PropTypes.bool.isRequired,
  setActive: PropTypes.func.isRequired,
};

export default CookieMod;
