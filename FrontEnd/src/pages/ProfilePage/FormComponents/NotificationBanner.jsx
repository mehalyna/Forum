import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import css from './NotificationBanner.module.css';

const NotificationBanner = ({ missingFields }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(missingFields.length > 0);

    const focusFirstUnfilledField = () => {
        if (missingFields.length === 0) return;

        setTimeout(() => {
            const firstUnfilledField = document.querySelector(`[name="${missingFields[0]}"]`);
            if (firstUnfilledField) {
                firstUnfilledField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstUnfilledField.focus();
            }
        }, 300);
    };

    useEffect(() => {
        if (missingFields.length > 0) {
            setIsVisible(true);
            focusFirstUnfilledField();
        } else {
            setIsVisible(false);
        }
    }, [missingFields]);

    if (!isVisible) return null;

    const handleClick = () => {
        navigate('/profile/general-info');
        setTimeout(() => {
            focusFirstUnfilledField();
        }, 300);
    };

    return (
        <div className={css.notification} onClick={handleClick}>
            Ваш профіль не відображається. Заповніть усі  <span className={css.required}>*</span>обов’язкові поля, щоб зробити його видимим.
        </div>
    );
};

NotificationBanner.propTypes = {
    missingFields: PropTypes.array.isRequired,
};

export default NotificationBanner;
