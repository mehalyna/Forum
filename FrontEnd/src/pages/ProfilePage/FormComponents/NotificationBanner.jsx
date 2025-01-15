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
        if (missingFields.length > 0) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [missingFields]);

    if (!isVisible) return null;

    const handleClick = () => {
        if (typeof setOpenSection === 'function') { // Перевірка, що передана функція
            const firstMissingField = missingFields[0];
            const sectionToOpen = ['surname', 'name', 'email'].includes(firstMissingField)
                ? 'Інформація про користувача'
                : 'Загальна інформація';

            setOpenSection(sectionToOpen);

            navigate('/profile/general-info');

            setTimeout(() => {
                focusFirstUnfilledField();
            }, 300);
        } else {
            console.error('setOpenSection is not a function');
        }
    };

    return (
        <div className={css.notification} onClick={handleClick}>
            Ваш профіль не відображається на сайті. Заповніть усі <span className={css.required}>*</span> обов’язкові поля, щоб зробити його видимим.
        </div>
    );
};

NotificationBanner.propTypes = {
    missingFields: PropTypes.array.isRequired,
    setOpenSection: PropTypes.func.isRequired,
};

export default NotificationBanner;

