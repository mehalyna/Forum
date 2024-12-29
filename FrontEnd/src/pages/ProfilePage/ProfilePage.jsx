import { useState, useEffect } from 'react';
import { DirtyFormContext } from '../../context/DirtyFormContext';
import { useAuth, useProfile } from '../../hooks';
import useWindowWidth from '../../hooks/useWindowWidth';
import { SCREEN_WIDTH } from '../../constants/constants';
import Loader from '../../components/Loader/Loader';
import Description from './ProfilePageComponents/Description';
import ProfileContent from './ProfilePageComponents/ProfileContent';
import EditProfileMobile from './Mobile/EditProfileMobile';
import css from './ProfilePage.module.css';

const ProfilePage = () => {
  const [formIsDirty, setFormIsDirty] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const windowWidth = useWindowWidth();

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
        <EditProfileMobile/>
      </DirtyFormContext.Provider>
    );
  }

  return (
    <div className={css['container']}>
      <DirtyFormContext.Provider value={{ formIsDirty, setFormIsDirty }}>
        {!profile ? (
          <Loader />
        ) : (
          <>
            <Description
              companyName={profile.name}
              companyLogo={profile?.logo?.path}
            />
            <ProfileContent
              user={user}
              profile={profile}
            />
          </>
        )}
      </DirtyFormContext.Provider>
    </div >
  );
};

export default ProfilePage;
