import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

import SignUpInputField from './SignUpInputField';
import SignUpPasswordField from './SignUpPasswordField';
import SignUpCheckboxField from './SignUpCheckboxField';

import styles from './SignUpFormContent.module.css';
import {
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
  NAME_SURNAME_PATTERN,
  COMPANY_NAME_PATTERN,
} from '../../../constants/constants';


export function SignUpFormContentComponent(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const reCaptchaRef = useRef();
  const onReCaptchaChange = () => reCaptchaRef.current = !reCaptchaRef.current;
  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const navigate = useNavigate();

  const errorMessageTemplates = {
    email: 'Електронна пошта не відповідає вимогам',
    password: 'Пароль не відповідає вимогам',
    confirmPassword: 'Паролі не співпадають. Будь ласка, введіть однакові паролі в обидва поля',
    nameSurnameFieldLength: 'Введіть від 2 до 50 символів',
    companyFieldLength: 'Введіть від 2 до 45 символів',
    notAllowedSymbols: 'Поле містить недопустимі символи та/або цифри',
    maxLength: 'Кількість символів перевищує максимально допустиму (128 символів)',
  };

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    criteriaMode: 'all',
  });

  const { setIsValid } = props;

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onChangeCheckbox = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setValue('businessEntity', [value]);
    }
  };

  const validateNameSurname = (value) => {
    const allowedSymbolsPattern = /^[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ'\s]+$/;
    const letterCount = (value.match(/[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]/g) || [])
      .length;
    if (!allowedSymbolsPattern.test(value)) {
      return errorMessageTemplates.notAllowedSymbols;
    }
    if (letterCount < 2) {
      return errorMessageTemplates.nameSurnameFieldLength;
    }
    return true;
  };

  const onBlurHandler = (fieldName) => {
    let fieldValue = getValues(fieldName);
    if (fieldValue !== undefined && fieldValue !== null) {
      fieldValue = fieldValue.replace(/\s{2,}/g, ' ').trim();
      setValue(fieldName, fieldValue);
    }
  };

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid, setIsValid]);

  const handleValidation = async () => {
    await trigger(['password', 'confirmPassword']);
  };

  useEffect(() => {
    if (watch('password') && watch('confirmPassword')) {
      handleValidation();
    }
  }, [watch('confirmPassword'), watch('password')]);

  const onSubmit = async () => {
    let recaptcha_token = null;
    try {
      recaptcha_token = await reCaptchaRef.current.executeAsync();
    } catch (error) {
      console.warn('reCAPTCHA failed or quota expired:', error);
    }

    const dataToSend = {
      email: getValues('email'),
      password: getValues('password'),
      re_password: getValues('confirmPassword'),
      name: getValues('name'),
      surname: getValues('surname'),
      captcha: recaptcha_token,
      company: {
        name: getValues('companyName'),
        is_registered: getValues('representative').indexOf('company') > -1,
        is_startup: getValues('representative').indexOf('startup') > -1,
        is_fop: getValues('businessEntity').indexOf('fop') > -1,
      },
    };

    axios({
      method: 'post',
      url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/`,
      data: dataToSend,
    })
      .then(() => {
        navigate('/sign-up/completion');
      })
      .catch((error) => {
        if (error.response.data.email) {
          setError('email', {
            type: 'manual',
            message: 'Ця електронна пошта вже зареєстрована',
          });
        }
        if (error.response && error.response.status === 400) {
          toast.error('Не вдалося зареєструвати користувача, сталася помилка');
        }
      });
  };

  return (
    <div className={styles['signup-form']}>
      <form
        id="signUpForm"
        className={styles['signup-form__container']}
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        noValidate
      >
        <div className={styles['signup-form__label']}>
          <label className={styles['signup-form__label--required']}>
            *
          </label>
          <label className={styles['signup-form__label--text']}>
            Обов&apos;язкові поля позначені зірочкою
          </label>
        </div>
        <SignUpInputField
          name="companyName"
          type="text"
          label="Назва компанії"
          placeholder="Введіть назву вашої компанії"
          register={register}
          validation={{
            required: 'Не ввели назву компанії',
            pattern: {
              value: COMPANY_NAME_PATTERN,
            },
            minLength: {
              value: 2,
              message: errorMessageTemplates.companyFieldLength,
            },
          }}
          maxLength={45}
          tooltip="Назва повинна містити від 2 до 45 символів"
          tooltipTrigger="focus"
          error={errors.companyName}
          onBlur={() => {
            onBlurHandler('companyName');
            trigger('companyName');
          }}
        />
        <SignUpInputField
          name="email"
          type="email"
          label="Електронна пошта"
          placeholder="Введіть свою електронну пошту"
          register={register}
          validation={{
            required: 'Не ввели електронну пошту',
            pattern: {
              value: EMAIL_PATTERN,
              message: errorMessageTemplates.email,
            },
          }}
          tooltip="Приклад електронної пошти logginname@example.com"
          error={errors.email}
          onBlur={() => trigger('email')}
        />
        <SignUpPasswordField
          name="password"
          label="Пароль"
          placeholder="Введіть пароль"
          register={register}
          validation={{
            required: 'Не ввели пароль',
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
            onBlurHandler('password');
            trigger('password');
          }}
        />
        <SignUpPasswordField
          name="confirmPassword"
          label="Повторіть пароль"
          placeholder="Введіть пароль ще раз"
          register={register}
          validation={{
            required: 'Не ввели пароль ще раз',
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
            onBlurHandler('confirmPassword');
            trigger('confirmPassword');
          }}
        />
        <SignUpInputField
          name="surname"
          type="text"
          label="Прізвище"
          placeholder="Введіть ваше прізвище"
          register={register}
          validation={{
            required: 'Не ввели прізвище',
            validate: validateNameSurname,
          }}
          tooltip={
            !NAME_SURNAME_PATTERN.test(getValues('surname')) &&
            'Прізвище повинне містити від 2 до 50 символів'
          }
          tooltipTrigger="focus"
          error={errors.surname}
          maxLength={50}
          onBlur={() => {
            onBlurHandler('surname');
            trigger('surname');
          }}
        />
        <SignUpInputField
          name="name"
          type="text"
          label="Ім‘я"
          placeholder="Введіть ваше ім‘я"
          register={register}
          validation={{
            required: 'Не ввели ім\'я',
            validate: validateNameSurname,
          }}
          tooltip={
            !NAME_SURNAME_PATTERN.test(getValues('name')) &&
            'Ім‘я повинне містити від 2 до 50 символів'
          }
          tooltipTrigger="focus"
          error={errors.name}
          maxLength={50}
          onBlur={() => {
            onBlurHandler('name');
            trigger('name');
          }}
        />
        <SignUpCheckboxField
          type="checkbox"
          label="Кого ви представляєте?"
          options={[
            { name: 'representative', value:'company', label: 'Зареєстрована компанія' },
            { name: 'representative', value: 'startup', label: 'Стартап проект, який шукає інвестиції' },
          ]}
          register={register}
          validation={{
            required:
              'Виберіть, кого ви представляєте',
          }}
          onChange={null}
          error={errors.representative}
        />
        <SignUpCheckboxField
          label="Який суб'єкт господарювання ви представляєте?"
          options={[
            { name: 'businessEntity', value:'fop', label: 'Фізична особа-підприємець' },
            { name: 'businessEntity', value:'yurosoba', label: 'Юридична особа' },
          ]}
          register={register}
          validation={{
            required:
            'Виберіть, який суб\'єкт господарювання ви представляєте'
          }}
          error={errors.businessEntity}
          onChange={onChangeCheckbox}
        />
        <div className={styles['signup-form__checkboxes-container--rules']}>
          <label className={styles['rules__line--text']}>
            Реєструючись, я погоджуюсь з{' '}
            <Link
              to="/terms-and-conditions"
              target="_blank"
              className={styles['rules__line--link']}
            >
              правилами використання
            </Link>
            {' '}сайту Craftmerge
          </label>
        </div>
        <ReCAPTCHA
          ref={reCaptchaRef}
          sitekey={process.env.REACT_APP_RECAPTCHA_V2_SITE_KEY}
          size="invisible"
          onChange={onReCaptchaChange}
          className={styles['signup-form__recaptcha']}
        />
      </form>
    </div>
  );
}
