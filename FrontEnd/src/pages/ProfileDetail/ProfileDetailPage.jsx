import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Loader from '../../components/Loader/Loader';
import ErrorPage404 from '../../pages/ErrorPages/ErrorPage404';

import BannerImage from './ProfileDetailBaner/BannerImage';
import TitleInfo from './TitelInfo/TitleInfo';
import DetailedInfoSection from './DetailedInfo/DetailedInfoSection';

import { ActiveLinksContext } from '../../context/ActiveLinksContext';

import classes from './ProfileDetailPage.module.css';


function ProfileDetailPage({ isAuthorized }) {
  const [activeLinks, setActiveLinks] = useState([]);
  const { id } = useParams();
  const urlProfile = `${process.env.REACT_APP_BASE_API_URL}/api/profiles/${id}`;

  async function fetcher(url) {
    return axios.get(url)
      .then(res => res.data);
  }

  const {
    data: fetchedProfile,
    error,
    isLoading,
  } = useSWR(urlProfile, fetcher);

  const notRequiredData = [
    'address', 'banner', 'logo', 'edrpou',
    'rnokpp', 'founded', 'product_info',
    'service_info', 'startup_idea', 'logistics', 'cooperation'
  ];

  const containsNotRequiredData = fetchedProfile ?
    Object.keys(fetchedProfile).some(key => notRequiredData.includes(key) &&
      fetchedProfile[key] !== '' &&
      fetchedProfile[key] !== null) : false;

  return (error && error.status !== 401) ? (
    <ErrorPage404 />
  ) : (
    <div className={
      isLoading ?
        classes['profile-detail__loader-content'] :
        classes['profile-detail__main']}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <ActiveLinksContext.Provider value={{ activeLinks, setActiveLinks }}>
          <BannerImage data={fetchedProfile} />
          <TitleInfo
            containsNotRequiredData={containsNotRequiredData}
            isAuthorized={isAuthorized}
            data={fetchedProfile}
          />
          <DetailedInfoSection
            containsNotRequiredData={containsNotRequiredData}
            isAuthorized={isAuthorized}
            data={fetchedProfile}
          />
        </ActiveLinksContext.Provider>
      )}
    </div>
  );
}

export default ProfileDetailPage;

ProfileDetailPage.propTypes = {
  isAuthorized: PropTypes.bool,
};
