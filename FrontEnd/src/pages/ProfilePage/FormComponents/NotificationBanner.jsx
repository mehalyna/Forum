import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import css from './NotificationBanner.module.css';

const NotificationBanner = ({ missingFields, setOpenSection }) => {
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
        setIsVisible(missingFields.length > 0);
    }, [missingFields]);

    if (!isVisible) return null;

    const handleClick = () => {
        if (typeof setOpenSection === 'function') {
            setOpenSection('Загальна інформація');
            navigate('/profile/general-info');
            focusFirstUnfilledField();
        } else {
            console.error('setOpenSection is not a function');
        }
    };

    return (
        <div className={css.notification} onClick={handleClick}>
            <p>
                Ваш профіль не відображається на сайті. Заповніть усі{' '}
                <span className={css.required}>*</span> обов’язкові поля, щоб зробити його видимим.
            </p>
        </div>
    );
};

NotificationBanner.propTypes = {
    missingFields: PropTypes.array.isRequired,
    setOpenSection: PropTypes.func.isRequired,
};

export default NotificationBanner;
