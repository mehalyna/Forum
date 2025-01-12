import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { DirtyFormContext } from '../../../context/DirtyFormContext';
import { validateRequiredFields, REQUIRED_FIELDS_USER_INFO} from '../../../utils/validateRequiredFields';
import { useAuth, useProfile } from '../../../hooks';
import checkFormIsDirty from '../../../utils/checkFormIsDirty';
import defineChanges from '../../../utils/defineChanges';
import HalfFormField from './FormFields/HalfFormField';
import Loader from '../../../components/Loader/Loader';
import ProfileFormButton from '../UI/ProfileFormButton/ProfileFormButton';
import css from './FormComponents.module.css';

const LABELS = {
  surname: 'Прізвище',
  name: 'Ім‘я',
  person_position: 'Посада в компанії чи стартапі',
  email: 'Електронна пошта',
};

const ERRORS = {
  surname: {
    error: false,
    message: '',
  },
  name: {
    error: false,
    message: '',
  },
  person_position: {
    error: false,
    message: '',
  },
};

const UserInfo = (props) => {
  const { user, mutate: userMutate } = useAuth();
  const { profile, mutate: profileMutate } = useProfile();
  const [updateUser, setUpdateUser] = useState(props.user);
  const [updateProfile, setUpdateProfile] = useState(props.profile);
  const [formStateErr, setFormStateErr] = useState(ERRORS);
  const { setFormIsDirty } = useContext(DirtyFormContext);

  const fields = {
    surname: { defaultValue: user?.surname ?? '', context: 'user' },
    name: { defaultValue: user?.name ?? '', context: 'user' },
    person_position: { defaultValue: profile?.person_position ?? null },
  };

  useEffect(() => {
    if (!profile || !user) return;
    const missing = validateRequiredFields(profile, user)
      .filter(field => REQUIRED_FIELDS_USER_INFO.includes(field.field))
      .map(field => field.field);
    setFormStateErr(prev => ({
      ...prev,
      ...missing.reduce((acc, field) => ({
        ...acc,
        [field]: { error: true, message: 'Це поле є обов’язковим для заповнення.' }
      }), {})
    }));
  }, [profile, user]);

  useEffect(() => {
    const isDirty = checkFormIsDirty(fields, updateUser, updateProfile);
    setFormIsDirty(isDirty);
  }, [user, profile, updateUser, updateProfile]);


  const errorMessageTemplates = {
    requiredField: 'Обов’язкове поле',
    fieldLength: 'Введіть від 2 до 50 символів',
    notAllowedSymbols: 'Поле містить недопустимі символи та/або цифри',
  };

  const validateFields = (fieldName, fieldValue) => {
    let isValid = true;
    let errorMessage = [];
    const allowedSymbolsPatterns = {
      person_position: /^[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ\-'\s]+$/,
      name: /^[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ'\s]+$/,
      surname: /^[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ'\s]+$/,
    };
    const letterCount = (
      fieldValue.match(/[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]/g) || []
    ).length;
    const isValidLength =
      letterCount >= 2 ||
      (fieldName === 'person_position' && letterCount === 0);
    const isValidPattern = allowedSymbolsPatterns[fieldName].test(fieldValue);
    const isRequiredField =
      (fieldName === 'name' && letterCount !== 0) ||
      (fieldName === 'surname' && letterCount !== 0) ||
      (fieldName === 'person_position');

    if (fieldValue && !isValidPattern) {
      isValid = false;
      errorMessage.push(errorMessageTemplates.notAllowedSymbols);
    }
    if (!isRequiredField) {
      isValid = false;
      errorMessage.push(errorMessageTemplates.requiredField);
    } else if (!isValidLength) {
      isValid = false;
      errorMessage.push(errorMessageTemplates.fieldLength);
    }

    setFormStateErr((prevState) => ({
      ...prevState,
      [fieldName]: {
        error: !isValid,
        message: errorMessage,
      },
    }));

    return isValid;
  };

  const errorsInNameSurname =
    formStateErr['name']?.message?.length > 1 ||
    formStateErr['surname']?.message?.length > 1;

  const checkFields = () => {
    let isValid = true;
    const fieldsToValidate = [
      { name: 'name', value: updateUser['name'] },
      { name: 'surname', value: updateUser['surname'] },
      { name: 'person_position', value: updateProfile['person_position'] },
    ];

    fieldsToValidate.forEach(({ name, value }) => {
      if (!validateFields(name, value)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const onUpdateField = (e) => {
    const { value: fieldValue, name: fieldName } = e.target;
    validateFields(fieldName, fieldValue);
    if (fieldName === 'person_position') {
      setUpdateProfile((prevState) => ({
        ...prevState,
        [fieldName]: fieldValue,
      }));
    } else {
      setUpdateUser((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }
  };

  const onBlurHandler = (e) => {
    const { value: rawFieldValue, name: fieldName } = e.target;
    const fieldValue = rawFieldValue.replace(/\s{2,}/g, ' ').trim();
    if (fieldName === 'person_position') {
      setUpdateProfile((prevState) => ({
        ...prevState,
        [fieldName]: fieldValue,
      }));
    } else {
      setUpdateUser((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!checkFields()) {
      toast.error(
        'Зміни не можуть бути збережені, перевірте правильність заповнення полів'
      );
    } else {
      const userData = defineChanges(fields, null, updateUser);
      const profileData = defineChanges(fields, updateProfile, null);
      axios
        .all([
          axios.patch(
            `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/me/`,
            userData.userChanges
          ),
          axios.patch(
            `${process.env.REACT_APP_BASE_API_URL}/api/profiles/${user.profile_id}`,
            profileData.profileChanges
          ),
        ])
        .then(
          axios.spread((updatedUserData, updatedProfileData) => {
            userMutate(updatedUserData.data);
            profileMutate(updatedProfileData.data);
            setFormIsDirty(false);
            toast.success('Зміни успішно збережено');
          })
        )
        .catch((error) => {
          console.error(
            'Помилка:',
            error.response ? error.response.data : error.message
          );
          if (!error.response || error.response.status !== 401) {
            toast.error('Не вдалося зберегти зміни, сталася помилка');
          }
        });
    }
  };

  return (
    <div className={css['form__container']}>
      <h3 className={css['form__head']}>Інформація про користувача</h3>
      <div className={css['divider']}></div>
      {updateUser && user && profile && updateProfile ? (
        <form
          id="UserInfo"
          onSubmit={handleSubmit}
          autoComplete="off"
          noValidate
        >
          <div
            className={`${css['fields']} ${errorsInNameSurname ? css['user_form_fields'] : ''
              }`}
          >
            <div className={css['fields-groups']}>
              <HalfFormField
                inputType="text"
                name="surname"
                fieldPlaceholder="Введіть ваше прізвище"
                label={LABELS.surname}
                updateHandler={onUpdateField}
                onBlur={onBlurHandler}
                error={
                  formStateErr['surname']['error']
                    ? formStateErr['surname']['message']
                    : null
                }
                requiredField={true}
                value={updateUser.surname}
                maxLength={50}
              />
              <HalfFormField
                inputType="text"
                name="name"
                fieldPlaceholder="Введіть ваше ім'я"
                label={LABELS.name}
                updateHandler={onUpdateField}
                onBlur={onBlurHandler}
                error={
                  formStateErr['name']['error']
                    ? formStateErr['name']['message']
                    : null
                }
                requiredField={true}
                value={updateUser.name}
                maxLength={50}
              />
            </div>
            <div className={css['fields-groups']}>
              <HalfFormField
                inputType="text"
                name="person_position"
                fieldPlaceholder="Введіть вашу посаду"
                label={LABELS.person_position}
                updateHandler={onUpdateField}
                onBlur={onBlurHandler}
                error={
                  formStateErr['person_position']?.['error']
                    ? formStateErr['person_position']['message']
                    : null
                }
                requiredField={false}
                value={updateProfile.person_position ?? ''}
                maxLength={50}
              />
              <HalfFormField
                inputType="text"
                name="email"
                label={LABELS.email}
                requiredField={true}
                value={updateUser.email}
              />
            </div>
          </div>
          <div className={css['bottom-divider']}></div>
          <ProfileFormButton />
        </form>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default UserInfo;
