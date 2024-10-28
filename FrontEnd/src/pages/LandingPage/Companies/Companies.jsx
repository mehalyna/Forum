import axios from 'axios';
import { useState, useEffect } from 'react';
import styles from './Companies.module.css';
import CompanyCard from '../../../components/CompanyCard/CompanyCard';
import PropTypes from 'prop-types';
import useSWR from 'swr';
import { Col, Row } from 'antd';

const MainCompanies = ({ isAuthorized }) => {
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const [searchResults, setSearchResults] = useState([]);
  const [newMembers, setNewMembers] = useState(true);

  const fetcher = async (url) => {
    const data = await axios.get(url);
    setSearchResults(data.data.results);
    return data.data.results;
  };

  const { data: companylist } = useSWR(
    `${baseUrl}/api/profiles/?ordering=-completeness,-created_at&page_size=4`,
    fetcher
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

  useEffect(() => {
    if (newMembers) {
      setNewMembers(false);
    }
  }, [newMembers, companylist, searchResults]);
  const companyDataList = searchResults;

  return (
    <div className={styles['new-companies-main']}>
      <div className={styles['new-companies-main__header']}>
        <h2 className={styles['new-companies-main__title']}>
          Нові учасники
        </h2>
      </div>
      <div className={styles['new-companies-block']}>
      <Row gutter={[16, 16]}>
          {companyDataList.map((result, resultIndex) => (
            <Col key={resultIndex} xs={24} sm={12} lg={6}>
              <CompanyCard
                profile={result}
                isAuthorized={isAuthorized}
                changeCompanies={changeCompanies}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default MainCompanies;

MainCompanies.propTypes = {
  isAuthorized: PropTypes.bool,
};
