import { useState, useEffect } from 'react';
import { DirtyFormContext } from '../../context/DirtyFormContext';
import { useAuth, useProfile } from '../../hooks';
import useWindowWidth from '../../hooks/useWindowWidth';
import { SCREEN_WIDTH } from '../../constants/constants';
import Loader from '../../components/Loader/Loader';
import Description from './ProfilePageComponents/Description';
import ProfileContent from './ProfilePageComponents/ProfileContent';
import EditProfileMobile from './Mobile/EditProfileMobile';
import NotificationBanner from './FormComponents/NotificationBanner';
import { validateRequiredFields, REQUIRED_FIELDS_GENERAL_INFO } from '../../utils/validateRequiredFields';
import css from './ProfilePage.module.css';

const ProfilePage = () => {
  const [formIsDirty, setFormIsDirty] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const windowWidth = useWindowWidth();
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    if (profile && user) {
      const fields = validateRequiredFields(profile, user)
        .filter(field => REQUIRED_FIELDS_GENERAL_INFO.includes(field));
      setMissingFields(fields);
    }
  }, [profile, user]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (formIsDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [formIsDirty]);

  if (windowWidth < SCREEN_WIDTH.tablet) {
    return (
      <DirtyFormContext.Provider value={{ formIsDirty, setFormIsDirty }}>
        <EditProfileMobile />
      </DirtyFormContext.Provider>
    );
  }

  return (
    <div className={css['main-profile__container']}>
      <div className={css['main-container']}>
        <DirtyFormContext.Provider value={{ formIsDirty, setFormIsDirty }}>
          <NotificationBanner missingFields={missingFields} />
          {!profile ? (
            <Loader />
          ) : (
            <>
              <Description
                companyName={profile.name}
                companyLogo={profile?.logo?.path}
              />
              <ProfileContent user={user} profile={profile} />
            </>
          )}
        </DirtyFormContext.Provider>
      </div>
    </div>
  );
};

export default ProfilePage;
