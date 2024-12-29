import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';

const CookieContext = createContext();

export const CookieProvider = ({ children }) => {
  const [cookies, setCookie] = useCookies(['cookies']);
  const [isCookieModalActive, setCookieModalActive] = useState(false);

  useEffect(() => {
    setCookieModalActive(cookies.cookies === undefined);
  }, [cookies]);

  const allowCookies = () => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setCookie('cookies', true, { expires: expirationDate, sameSite: 'lax' });
    setCookieModalActive(false);
  };

  const declineCookies = () => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000);
    setCookie('cookies', false, { expires: expirationDate, sameSite: 'lax' });
    setCookieModalActive(true);
  };

  return (
    <CookieContext.Provider
      value={{
        isCookieModalActive,
        allowCookies,
        declineCookies,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

CookieProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCookieContext = () => useContext(CookieContext);
