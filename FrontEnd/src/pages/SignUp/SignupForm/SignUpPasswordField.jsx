import PropTypes from 'prop-types';
import { ErrorMessage } from '@hookform/error-message';
import classNames from 'classnames';
import EyeVisible from '../../../pages/Authorization/EyeVisible';
import EyeInvisible from '../../../pages/Authorization/EyeInvisible';
import styles from './SignUpFormContent.module.css';

const SignUpPasswordField = ({
  name,
  label,
  placeholder,
  showPassword,
  togglePassword,
  register,
  errors,
  validation,
  onBlur,
}) => {

 return (
    <div className={styles['signup-form__item']}>
      <div className={styles['signup-form__label']}>
        <label className={styles['signup-form__label--required_special']}>
          *
        </label>
        <div className={styles['signup-form__label--password']}>
          <label>{label}</label>
          {name === 'password' ? (<label className={styles['signup-form__label--hint']}>
            Пароль повинен мати 8+ символів, містити принаймні велику, малу літеру (A..Z, a..z) та цифру (0..9).
          </label>) : null}
        </div>
      </div>
      <div
        className={classNames(styles['signup-form__field__password'], {
          [styles['signup-form__field__password--error']]: errors[name],
          [styles['signup-form__field__password--show']]: showPassword,
        })}
      >
        <input
          type={showPassword ? 'text' : 'password'}
          {...register(name, validation)}
          className={styles['signup-form__input__password']}
          placeholder={placeholder}
          onBlur={onBlur}
        />
        <span
          className={styles['password-visibility']}
          onClick={togglePassword}
        >
          {!showPassword ? <EyeInvisible /> : <EyeVisible />}
        </span>
      </div>
      <div className={styles['signup-form__error']}>
        <ErrorMessage
          errors={errors}
          name={name}
          render={({ messages }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <p key={type}>{message}</p>
            ))
          }
        />
      </div>
    </div>
  );
};

SignUpPasswordField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  validation: PropTypes.object,
  onBlur: PropTypes.func,
};

export default SignUpPasswordField;
