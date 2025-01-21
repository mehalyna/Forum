import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import css from './NotificationBanner.module.css';

const NotificationBanner = ({ missingFields, setOpenSection }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(missingFields.length > 0);
  const [shouldFocusField, setShouldFocusField] = useState(false);

  const focusFirstUnfilledField = useCallback(() => {
    if (missingFields.length === 0) return;

    setTimeout(() => {
      const firstUnfilledField = document.querySelector(`[name="${missingFields[0]}"]`);
      if (firstUnfilledField) {
        firstUnfilledField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstUnfilledField.focus();
      }
    }, 300);
  }, [missingFields]);

  useEffect(() => {
    setIsVisible(missingFields.length > 0);
  }, [missingFields]);

  useEffect(() => {
    if (shouldFocusField) {
      focusFirstUnfilledField();
      setShouldFocusField(false);
    }
  }, [shouldFocusField, focusFirstUnfilledField]);

  const handleClick = () => {
    if (typeof setOpenSection === 'function') {
      setShouldFocusField(true);
      setOpenSection('Загальна інформація');
      navigate('/profile/general-info');
    } else {
      console.error('setOpenSection is not a function');
    }
  };

  return (
    isVisible && (
      <div className={css.notification} onClick={handleClick}>
        <p className={css['notification-text']}>
          Ваш профіль не відображається на сайті.
        </p>
        <p className={css['notification-text']}>
          &nbsp;Заповніть усі{' '}
          <span className={css.required}>*</span> обов’язкові поля, щоб зробити його видимим.
        </p>
      </div>
    )
  );
};

NotificationBanner.propTypes = {
  missingFields: PropTypes.array.isRequired,
  setOpenSection: PropTypes.func.isRequired,
};

export default NotificationBanner;
