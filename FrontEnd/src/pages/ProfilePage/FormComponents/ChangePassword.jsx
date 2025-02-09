import axios from 'axios';
import { PropTypes } from 'prop-types';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { DirtyFormContext } from '../../../context/DirtyFormContext';
import PasswordField from './FormFields/PasswordField';
import Loader from '../../../components/Loader/Loader';
import css from './ChangePassword.module.css';

export default function ChangePassword(props) {
  const { setFormIsDirty } = useContext(DirtyFormContext);
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

  useEffect(() => {
    setFormIsDirty(isDirty);
  }, [isDirty, setFormIsDirty]);

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
    <div className={css['form__container']}>
      <h3 className={css['form__head']}>Змінити пароль</h3>
      <div className={css['divider']}></div>
      {props.user ? (
        <form id="ChangePassword" onSubmit={handleSubmit(handleFormSubmit)}>
          <PasswordField
            inputId="currentPassword"
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
            inputId="newPassword"
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
            inputId="reNewPassword"
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
          <div className={css['bottom-divider']}></div>
          <div className={css['submit-button__conteiner']}>
            <button
              className={css['submit-button']}
              type="submit"
            >
              Зберегти новий пароль
            </button>
          </div>
        </form>
      ) : (
        <Loader />
      )}
    </div>
  );
}

ChangePassword.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    profile_id: PropTypes.number.isRequired,
    is_staff: PropTypes.bool.isRequired,
  }).isRequired,
};
