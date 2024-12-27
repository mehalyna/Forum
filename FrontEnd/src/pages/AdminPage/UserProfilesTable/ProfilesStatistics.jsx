import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { Descriptions, Segmented } from 'antd';
import Loader from '../../../components/Loader/Loader';
import css from './ProfilesStatistics.module.css';

async function fetcher(url) {
  const response = await axios.get(url);
  return response.data;
}

function ProfilesStatistics() {
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const [period, setPeriod] = useState('');
  const url = `${baseUrl}/api/admin/profiles/statistics/${
    period ? `?period=${period}` : ''
  }`;
  const { data: statistics, error, isLoading } = useSWR(url, fetcher);

  const items = statistics
    ? [
        {
          key: '1',
          label: 'Кількість зареєстрованих компаній',
          children: statistics.companies_count,
        },
        {
          key: '2',
          label: 'Кількість Інвесторів',
          children: statistics.investors_count,
        },
        {
          key: '3',
          label: 'Кількість Cтратапів',
          children: statistics.startups_count,
        },
        {
          key: '4',
          label: 'Кількість заблокованих компаній',
          children: statistics.blocked_companies_count,
        },
      ]
    : [];

  return (
    <div className={css['statistics-container']}>
      <Segmented
        className={css['segmented-container']}
        value={period}
        options={[
          {label: 'Загалом', value: ''},
          {label: 'День', value: 'day'},
          {label: 'Тиждень', value: 'week'},
          {label: 'Місяць', value: 'month'},
          {label: 'Рік', value: 'year'},
        ]}
        onChange={(value) => setPeriod(value)}
      />
      {isLoading && (
        <div className={css['loader-container']}>
          <Loader />
        </div>
      )}
      {error && (
        <div className={css['error']}>Не вдалося отримати статистику компаній</div>
      )}
      {!isLoading && !error && (
        <Descriptions
          title="Статистика компаній"
          column={1}
          bordered
          size="small"
          items={items}
        />
      )}
    </div>
  );
}

export default ProfilesStatistics;
