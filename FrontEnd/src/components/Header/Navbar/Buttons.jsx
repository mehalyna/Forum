import { Link } from 'react-router-dom';
import {PropTypes} from 'prop-types';
import css from './Buttons.module.css';

function Buttons({ adminPage }) {
    return (
        <div className={css['header-buttons-section']}>
            <div className={css['header-login-element']}>
                <Link className={css['header-login__button']} to="/login">Увійти</Link>
            </div>
            {!adminPage && <Link className={css['header-register__button']} to="/sign-up">Зареєструватися</Link>}
        </div>
    );
}

Buttons.propTypes = {
    adminPage: PropTypes.bool.isRequired,
  };

export default Buttons;
