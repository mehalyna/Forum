import axios from 'axios';
import { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

import PasswordField from '../../ProfilePage/FormComponents/FormFields/PasswordField';
import Loader from '../../../components/Loader/Loader';
import AdminSubmitButton from '../../../components/MiniComponents/AdminSubmitButton';

import classes from './ChangeAdminPassword.module.css';

export default function ChangeAdminPassword(props) {

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    reset,
    trigger,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'all',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      reNewPassword: '',
    },
  });

  const handleValidation = async () => {
      await trigger(['newPassword', 'reNewPassword']);
    };

  useEffect(() => {
    if (watch('newPassword') && watch('reNewPassword')) {
      handleValidation();
    }
  }, [watch('reNewPassword'), watch('newPassword')]);

  const handleFormSubmit = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/set_password/`,
        {
          current_password: getValues('currentPassword'),
          new_password: getValues('newPassword'),
          re_new_password: getValues('reNewPassword'),
        }
      )
      .then(() => toast.success('Пароль успішно змінено'))
      .catch((error) => {
        if (error.response && error.response.data && error.response.data['new_password']) {
          const newPasswordError = error.response.data['new_password'][0];
          if (newPasswordError === 'This password is too common.') {
          toast.error('Пароль занадто поширений. Створіть інший пароль.');
        } else if (newPasswordError.startsWith('The password is too similar to the')) {
          toast.error('Пароль подібний на іншу персональну інформацію облікового запису. Створіть інший пароль.');
        }
      } else
        toast.error('Виникла помилка. Можливо, вказано невірний поточний пароль');
      });
    reset();
  };

  return (
    <div className={classes['form__container']}>
      {props.user ? (
        <form className={classes['change-password-form']} id="ChangeAdminPassword" onSubmit={handleSubmit(handleFormSubmit)} >
            <PasswordField
              inputId="currentAdminPassword"
              name="currentPassword"
              label="Поточний пароль"
              register={register}
              error={errors}
              watch={watch}
              checkValid={false}
              checkMatch={{
                isCheck: false,
                checkWith: null,
              }}
            />
            <PasswordField
              inputId="newAdminPassword"
              name="newPassword"
              label="Новий пароль"
              error={errors}
              register={register}
              watch={watch}
              checkValid={true}
              checkMatch={{
                isCheck: false,
                checkWith: null,
              }}
            />
            <PasswordField
              inputId="reNewAdminPassword"
              name="reNewPassword"
              label="Повторіть новий пароль"
              error={errors}
              register={register}
              watch={watch}
              checkValid={false}
              checkMatch={{
                isCheck: true,
                checkWith: 'newPassword',
              }}
            />
          <AdminSubmitButton disabled={!isDirty}/>
        </form>
      ) : (
        <Loader />
      )}
    </div>
  );
}

ChangeAdminPassword.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    is_staff: PropTypes.bool.isRequired,
  }).isRequired,
};
