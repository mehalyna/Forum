import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './SignUpFormContent.module.css';

const SignUpCheckboxField = ({ label, options, register, validation, error, onChange }) => {
    return (
      <div className={styles['representative']}>
        <div className={styles['representative__title']}>
          <label className={styles['signup-form__label--required']}>*</label>
          <label>{label}</label>
        </div>
        <div className={styles['representative__content']}>
          {options.map(({ name, value, label }) => (
            <div key={[name, value]} className={styles['representative__option']}>
              <div
                className={classNames(styles['representative__checkbox-container'], {
                  [styles['representative__input--error']]: error,
                })}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={value}
                  {...register(name, { ...validation, onChange})}
                />
                </div>
                <label className={styles['representative__label']}>{label}</label>
            </div>
          ))}
        </div>
        {error && <p className={styles['signup-form__error']}>{error.message}</p>}
      </div>
    );
  };

  SignUpCheckboxField.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.array,
    register: PropTypes.func.isRequired,
    error: PropTypes.object,
    validation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  };

export default SignUpCheckboxField;
