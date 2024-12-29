import axios from 'axios';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';

import DefaultLogo from './DefaultLogo';
import PendingStatus from '../../../components/MiniComponents/PendingModerationIcon/PendingStatus';
import CategoryBadges from '../../../components/MiniComponents/CategoryBadges';
import StarForLike from '../../../components/MiniComponents/StarForLike';
import { useAuth } from '../../../hooks';

import classes from './TitleInfo.module.css';

function truncateRegionName(regionName) {
  if (!regionName) return '';
  return regionName.replace(/область/g, 'обл.');
}

export default function TitleInfo({ isAuthorized, data }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(data.is_saved);

  const profile = useMemo(() => {
    return {
      id: data.id,
      personId: data.person,
      name: data.name,
      activities:
        data.activities && data.activities.length
          ? data.activities.map((activity) => activity.name).join(', ')
          : null,
      regions: truncateRegionName(data.regions_ukr_display),
      categories: data.categories || [],
      isSaved: data.is_saved,
      logo: data.logo,
    };
  }, [data]);

  const ownProfile = user && user.id === profile.personId;

  const handleSave = async () => {
    setIsSaved(true);
    try {
      await axios.post(`${process.env.REACT_APP_BASE_API_URL}/api/saved-list/`, { company_pk: profile.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSaved = async () => {
    setIsSaved(false);
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_API_URL}/api/saved-list/${profile.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToEditProfile = () => {
    navigate('/profile/user-info');
  };

  return (
    <div className={classes['title-block']}>
      <div className={classes['title-block__content']}>
        <div className={classes['title-block__content-info']}>
          <div className={classes['title-block__logo-block']}>
            <div className={classes['title-block__logo-tooltip']}>
              <PendingStatus profile={data} elementType="logo" />
            </div>
            {!profile.logo?.path ? (
              <DefaultLogo />
            ) : (
              <img
                className={classes['title-block__logo-img']}
                src={profile.logo?.path}
                alt="Логотип компанії"
                title="Логотип компанії"
              />
            )}
          </div>
          <div className={classes['title-block__about']}>
            <p className={classes['title-block__activity']}>
              {profile.activities}
            </p>
            <div className={classes['title-block__company']}>
              <h2 className={classes['title-block__company_name']}>
                {profile.name}
              </h2>
              <p className={classes['title-block__company_region']}>
                {profile.regions}
              </p>
              <div className={classes['title-block__company_category']}>
                <CategoryBadges categories={profile.categories} />
              </div>
            </div>
          </div>
        </div>
        {isAuthorized && (
          <div className={classes['title-block__button-block']}>
            {!ownProfile ? (
              <button
                onClick={isSaved ? handleDeleteSaved : handleSave}
                type="button"
                className={classNames(classes['title-block__button'], {
                  [classes['added_to_saved__button']]: isSaved,
                })}
              >
                <span
                  className={classNames(classes['title-block__button--text'], {
                    [classes['added_to_saved__button--text']]: isSaved,
                  })}
                >
                  {!isSaved ? 'Додати в збережені' : 'Додано в збережені'}
                </span>
                <StarForLike
                  isSaved={isSaved}
                  isAuthorized={isAuthorized}
                  ownProfile={ownProfile}
                  styleOutlined={{ color: isSaved ? '#FFF' : '#000', fontSize: '24px' }}
                />
              </button>
            ) : (
              <a
                role="link"
                className={`${classes['title-block__button']} ${classes['title-block__link']}`}
                onClick={navigateToEditProfile}
              >
                <span className={classes['title-block__button--text']}>Редагувати</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

TitleInfo.propTypes = {
  isAuthorized: PropTypes.bool,
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    person: PropTypes.number,
    address: PropTypes.string,
    regions_ukr_display: PropTypes.string,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
    is_saved: PropTypes.bool,
    logo: PropTypes.shape({
      path: PropTypes.string,
      uuid: PropTypes.string,
    }),
  }).isRequired,
};
