import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

import { PASSWORD_PATTERN } from '../../../constants/constants';
import SignUpPasswordField from '../../SignUp/SignupForm/SignUpPasswordField';

import styles from './RestorePasswordFormContent.module.css';

export function RestorePasswordFormContentComponent({ setIsValid }) {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    criteriaMode: 'all',
   });

  const errorMessageTemplates = {
    password: 'Пароль не відповідає вимогам',
    confirmPassword: 'Паролі не співпадають. Будь ласка, введіть однакові паролі в обидва поля',
    maxLength: 'Кількість символів перевищує максимально допустиму (128 символів)',
  };

  const handleValidation = async () => {
    await trigger(['password', 'confirmPassword']);
  };

  useEffect(() => {
    if (watch('password') && watch('confirmPassword')) {
      handleValidation();
    }
  }, [watch('confirmPassword'), watch('password')]);

  useEffect(() => {
    const formIsValid = isValid;
    setIsValid(formIsValid);
  }, [isValid, setIsValid]);

  const onSubmit = (formData) => {
    const dataToSend = {
      uid: uid,
      token: token,
      new_password: formData.password,
      re_new_password: formData.confirmPassword,
    };

  axios
    .post(
      `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/reset_password_confirm/`,
      dataToSend
    )
    .then(() => {
      setIsValid(true);
      navigate('/reset-password/successfully');
    })
    .catch((error) => {
      if (error.response && error.response.data && error.response.data['new_password']) {
        const newPasswordError = error.response.data['new_password'][0];
        if (newPasswordError === 'This password is too common.') {
        toast.error('Пароль занадто поширений. Створіть інший пароль.');
      } else if (newPasswordError.startsWith('The password is too similar to the')) {
        toast.error('Пароль подібний на іншу персональну інформацію облікового запису. Створіть інший пароль.');
      }
    } else {
      navigate('/reset-password/failed');
    }
    });
  };

  return (
    <div>
      <div className={styles['reset-password-form']}>
        <form
          id="resetPasswordForm"
          className={styles['reset-password-form__container']}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          noValidate
        >
         <SignUpPasswordField
          name="password"
          label="Новий пароль"
          register={register}
          validation={{
            required: 'Не ввели новий пароль',
            pattern: {
              value: PASSWORD_PATTERN,
              message: errorMessageTemplates.password,
            },
            maxLength: {
              value: 128,
              message: errorMessageTemplates.maxLength
            },
          }}
          errors={errors}
          togglePassword={togglePassword}
          showPassword={showPassword}
          onBlur={() => {
            trigger('password');
          }}
        />
        <SignUpPasswordField
          name="confirmPassword"
          label="Повторіть новий пароль"
          register={register}
          validation={{
            required: 'Не ввели новий пароль ще раз',
            maxLength: {
              value: 128,
              message: errorMessageTemplates.maxLength
            },
            validate: (value) =>
              watch('password') !== value
                ? errorMessageTemplates.confirmPassword
                : null,
          }}
          errors={errors}
          togglePassword={toggleConfirmPassword}
          showPassword={showConfirmPassword}
          onBlur={() => {
            trigger('confirmPassword');
          }}
        />
        </form>
      </div>
    </div>
  );
}

RestorePasswordFormContentComponent.propTypes = {
  setIsValid: PropTypes.func.isRequired,
};
