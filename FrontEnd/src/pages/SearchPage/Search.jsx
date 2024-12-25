import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import axios from 'axios';
import useSWR from 'swr';

import useWindowWidth from '../../hooks/useWindowWidth';
import { definePageSize } from '../../utils/definePageSize';
import { PAGE_SIZE } from '../../constants/constants';

import Loader from '../../components/Loader/Loader';
import ProfileList from '../ProfileList/ProfileList';
import styles from './Search.module.scss';

export function Search({ isAuthorized }) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('name');
  const pageNumber = Number(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [pageSize, setPageSize] = useState(PAGE_SIZE.mobile);
  const servedAddress = process.env.REACT_APP_BASE_API_URL;

  async function fetcher(url) {
    return axios.get(url)
    .then(res => res.data);
  }

  const { data: companylist, isLoading } = useSWR(
    `${servedAddress}/api/search/?name=${searchTerm}&ordering=name&page_size=${pageSize}&page=${currentPage}`,
    fetcher,
    {onSuccess: (data) => setSearchResults(data.results)}
  );

  const changeCompanies = (id, isSaved) => {
    const newCompanies = [...searchResults];
    for (let company of newCompanies) {
      if (company.id == id) {
        company.is_saved = isSaved;
      }
    }
    setSearchResults(newCompanies);
  };

  const windowWidth = useWindowWidth();

  useEffect(() => {
    definePageSize(windowWidth, setPageSize);
  }, [windowWidth]);

  const updateQueryParams = (newPage) => {
    searchParams.set('page', newPage);
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams(page);
  };

  useEffect(() => {
    if (companylist?.total_items === 0) {
      setCurrentPage(1);
      searchParams.delete('page');
      setSearchParams(searchParams);
    } else {
      const totalPages = Math.ceil(companylist?.total_items / pageSize);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
        updateQueryParams(totalPages);
      }
    }
  }, [companylist?.total_items, pageSize, currentPage]);

  return (
    <div className={styles['search-page__outer']}>
      <div
        className={classNames(
          styles['search-page'],
          { [styles['search-page__empty']]: companylist?.total_items === 0}
        )}
      >
        {isLoading ?
        <Loader/> : (
          <>
            <div className={styles['search-page__results-count']}>
              {searchResults && (
                <div className={styles['search-results']}>
                  <h3 className={styles['search-results__text']}>
                    Результати пошуку
                    <span className={styles['search-field__entered-value']}>
                      {` “${searchTerm}” `}
                    </span>
                    : {companylist?.total_items || 0}
                  </h3>
                </div>
              )}
            </div>
            <div className={styles['search-list__content--items']}>
              <ProfileList
                isAuthorized={isAuthorized}
                emptyText={' '}
                profiles={searchResults}
                items={companylist?.total_items}
                paginationFunc={handlePageChange}
                current={currentPage}
                pageSize={pageSize}
                changeCompanies={changeCompanies}
              />
            </div>
          </>
        )}
      </div>
      {companylist?.total_items === 0 &&
        <div className={styles['search-page__error']}>
          <p className={styles['search-result__error']}>
            Пошук не дав результатів
          </p>
        </div>
      }
    </div>
  );
}

export default Search;

Search.propTypes = {
  isAuthorized: PropTypes.bool,
};
