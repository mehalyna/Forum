import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import useWindowWidth from '../../hooks/useWindowWidth';
import { definePageSize } from '../../utils/definePageSize';
import { PAGE_SIZE } from '../../constants/constants';
import { SCREEN_WIDTH } from '../../constants/constants';

import ErrorPage404 from '../ErrorPages/ErrorPage404';
import Loader from '../../components/Loader/Loader';
import ProfileListHeader from './ProfileListHeader';
import ProfileList from './ProfileList';

import css from './ProfileListPage.module.css';

const COMPANY_TYPE = [
  { title: 'Усі підприємства', key: 'all', value: '' },
  { title: 'Компанії', key: 'companies', value: 'companies' },
  { title: 'Стартапи', key: 'startups', value: 'startups' },
];

const ACTIVITY_TYPE = [
  { title: 'Усі сектори', key: 'all', value: '' },
  { title: 'Виробники', key: 'producers', value: 'producers' },
  { title: 'Імпортери', key: 'importers', value: 'importers' },
  { title: 'Роздрібні мережі', key: 'retailers', value: 'retailers' },
  { title: 'HORECA', key: 'horeca', value: 'horeca' },
  { title: 'Інші послуги', key: 'other-services', value: 'other-services' },
];

export default function ProfileListPage({ isAuthorized, isSaved }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;
  const companyType = searchParams.get('companyType') || '';
  const activity = searchParams.get('activity') || '';
  const [profiles, setProfiles] = useState([]);
  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [pageSize, setPageSize] = useState(PAGE_SIZE.mobile);
  const [activeTab, setActiveTab] = useState(searchParams.get('companyType') || 'all');
  const [activeBtn, setActiveBtn] = useState(searchParams.get('activity') || 'all');

  const windowWidth = useWindowWidth();
  const linkText = windowWidth >= SCREEN_WIDTH.tablet ? 'Усі підприємства' : 'Усі';

  useEffect(() => {
    definePageSize(windowWidth, setPageSize);
  }, [windowWidth]);
  
  const [url, setUrl] = useState(
    `${process.env.REACT_APP_BASE_API_URL}/api/profiles/?ordering=name&page_size=${pageSize}&page=${currentPage}`
  );


  const companyTypeMap = {
    '': '',
    companies: 'is_registered=True',
    startups: 'is_startup=True',
  };

  const activityTypeMap = {
    '': '',
    producers: 'activities__name=Виробник',
    importers: 'activities__name=Імпортер',
    retailers: 'activities__name=Роздрібна мережа',
    horeca: 'activities__name=HORECA',
    'other-services': 'activities__name=Інші послуги',
  };

  useEffect(() => {
    const companyTypeFilter = companyTypeMap[companyType] || '';
    const activityTypeFilter = activityTypeMap[activity] || '';

    setFilters([companyTypeFilter, activityTypeFilter].filter(Boolean));
    setCurrentPage(1);
  }, [companyType, activity]);

  useEffect(() => {
    const baseUrl = `${process.env.REACT_APP_BASE_API_URL}/api/profiles/`;
    let queryString = !isSaved
      ? `?ordering=name&page_size=${pageSize}&page=${currentPage}`
      : `?is_saved=True&ordering=name&page_size=${pageSize}&page=${currentPage}`;

    if (filters.length === 2) {
      queryString = !isSaved
        ? `?${filters.join('&')}&ordering=name&page_size=${pageSize}&page=${currentPage}`
        : `?is_saved=True&${filters.join('&')}&ordering=name&page_size=${pageSize}&page=${currentPage}`;
    } else if (filters.length === 1) {
      queryString = !isSaved
        ? `?${filters[0]}&ordering=name&page_size=${pageSize}&page=${currentPage}`
        : `?is_saved=True&${filters[0]}&ordering=name&page_size=${pageSize}&page=${currentPage}`;
    }

    setUrl(`${baseUrl}${queryString}`);
    setCurrentPage(pageNumber);
  }, [filters, pageNumber, pageSize, currentPage, isSaved]);

  async function fetcher(url) {
    return axios.get(url)
    .then(res => res.data);
  }

  const {
    data: fetchedProfiles,
    error,
    isLoading,
  } = useSWR(url, fetcher, {onSuccess: (data) => setProfiles(data.results)});

  useEffect(() => {
    if (fetchedProfiles?.total_items === 0) {
      setCurrentPage(1);
      searchParams.delete('page');
      setSearchParams(searchParams);
    } else {
      const totalPages = Math.ceil(fetchedProfiles?.total_items / pageSize);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
        updateQueryParams(totalPages);
      }
    }
  }, [fetchedProfiles, pageSize, currentPage, isSaved]);

  useEffect(() => {
    setActiveTab(searchParams.get('companyType') || 'all');
    setActiveBtn(searchParams.get('activity') || 'all');
  }, [searchParams]);

  const changeCompanies = (companyId, saved) => {
    setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
            profile.id === companyId ? { ...profile, is_saved: saved } : profile
        )
    );
  };

  const handleFilters = (companyType, activity) => {
    if (companyType) {
      searchParams.set('companyType', companyType);
    } else {
      searchParams.delete('companyType');
    }

    if (activity) {
      searchParams.set('activity', activity);
    } else {
      searchParams.delete('activity');
    }

    setSearchParams(searchParams);
  };

  const updateQueryParams = (newPage) => {
    searchParams.set('page', newPage);
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams(page);
  };

  return (
    <div className={css.page}>
      {error && error.response.status !==401 ? (
        <ErrorPage404 />
      ) : (
        <div className={css['page-content']}>
          <div className={css['company-list__header--wrapper']}>
            <div className={css['company-list__header']}>
                  <h2 className={css['company-list__title']}>
                      {!isSaved ? 'Підприємства та сектори' : 'Мої збережені'}
                  </h2>
                  <div className={css['company-list__tabs']}>
                    {COMPANY_TYPE.map((item) => (
                      <div
                        key={item.key}
                        className={css['company-list__tabs--wrapper']}>
                        <span
                          className={activeTab === item.key ?
                            css['company-list__tabs--element--active'] :
                            css['company-list__tabs--element']}
                          onClick={() => (handleFilters(item.value, activity))}
                        >
                          {item.title === 'Усі підприємства' ? linkText : item.title}
                        </span>
                        <span className={activeTab === item.key ? css['divider'] : ''}>
                        </span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          <div className={css['company-list__content']}>
            <div className={css['company-list__content--btns-wrapper']}>
              <div className={css['company-list__content--btns']}>
                {ACTIVITY_TYPE.map((item) => (
                  <button
                    key={item.key}
                    className={activeBtn === item.key ?
                      css['company-list__btns--element--active'] :
                      css['company-list__btns--element']}
                    onClick={() => (handleFilters(companyType, item.value))}
                  >
                    {item.title}
                  </button>
                    ))}
              </div>
              <ProfileListHeader number={fetchedProfiles?.total_items}/>
            </div>
            {isLoading ? (
              <Loader />
            ) : (
              <div className={css['company-list__content--items']}>
                <ProfileList
                  isAuthorized={isAuthorized}
                  emptyText={'Жодна компанія не відповідає обраному фільтру.'}
                  profiles={profiles}
                  items={fetchedProfiles?.total_items}
                  paginationFunc={handlePageChange}
                  current={currentPage}
                  pageSize={pageSize}
                  changeCompanies={changeCompanies}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
