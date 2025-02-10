import { useEffect, useState } from 'react';
import { useAuth, useProfile } from '../../../hooks';
import { validateRequiredFields, REQUIRED_FIELDS_GENERAL_INFO } from '../../../utils/validateRequiredFields';
import NotificationBanner from '../FormComponents/NotificationBanner';
import Accordion from './Accordion';
import AdditionalInfo from '../FormComponents/AdditionalInfo';
import ContactsInfo from '../FormComponents/ContactsInfo';
import DeleteProfilePage from '../FormComponents/DeleteProfileComponent/DeleteProfilePage';
import GeneralInfo from '../FormComponents/GeneralInfo';
import ProductServiceInfo from '../FormComponents/ProductServiceInfo';
import StartupInfo from '../FormComponents/StartupInfo';
import UserInfo from '../FormComponents/UserInfo';
import ChangePassword from '../FormComponents/ChangePassword';
import Loader from '../../../components/Loader/Loader';
import css from './EditProfileMobile.module.css';

const EditProfileMobile = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [missingFields, setMissingFields] = useState([]);
  const [openSectionIndex, setOpenSectionIndex] = useState(null);

  useEffect(() => {
    if (profile && user) {
      const generalInfoMissing = validateRequiredFields(profile, user)
        .filter(field => REQUIRED_FIELDS_GENERAL_INFO.includes(field));

      setMissingFields([...generalInfoMissing]);
    }
  }, [profile, user]);

  if (user && profile) {
    const sections = [
      {
        title: 'Інформація про користувача',
        content: <UserInfo user={user} profile={profile} />,
      },
      {
        title: 'Загальна інформація',
        content: <GeneralInfo profile={profile} />,
      },
      {
        title: 'Контакти',
        content: <ContactsInfo profile={profile} />,
      },
      {
        title: 'Інформація про товари/послуги',
        content: <ProductServiceInfo profile={profile} />,
        disabled: !profile.is_registered,
      },
      {
        title: 'Додаткова інформація',
        content: <AdditionalInfo profile={profile} />,
        disabled: !profile.is_registered,
      },
      {
        title: 'Стартап',
        content: <StartupInfo profile={profile} />,
        disabled: !profile.is_startup,
      },
      {
        title: 'Змінити пароль',
        content: <ChangePassword user={user} />,
      },
      {
        title: 'Видалити профіль',
        content: <DeleteProfilePage />,
      },
    ];

    return (
      <div className={css['main-container']}>
        <div className={css['container']}>
          {missingFields.length > 0 && (
            <NotificationBanner missingFields={missingFields} sections={sections} setOpenSectionIndex={setOpenSectionIndex} />
          )}
          <h2 className={css['head']}>Профіль користувача</h2>
          <Accordion sections={sections} openSectionIndex={openSectionIndex} setOpenSectionIndex={setOpenSectionIndex} />
        </div>
      </div>
    );
  } else {
    return <Loader />;
  }
};

export default EditProfileMobile;
