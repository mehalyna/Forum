import axios from 'axios';
import useSWR from 'swr';
import { Descriptions } from 'antd';
import Loader from '../../../components/Loader/Loader';
import css from './ProfilesStatistics.module.css';

async function fetcher(url) {
  const response = await axios.get(url);
  return response.data;
}

function ProfilesStatistics() {
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const url = `${baseUrl}/api/admin/profiles/statistics/`;
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

  return isLoading ? (
    <div className={css['loader-container']}>
      <Loader />
    </div>
  ) : error ? (
    <div className={css['error']}>Не вдалося отримати статистику компаній</div>
  ) : (
    <div className={css['statistics-container']}>
      <Descriptions
        title="Статистика компаній"
        column={1}
        bordered
        size="small"
        items={items.map((item) => ({
          ...item,
          label: (
            <span className={css['description-item-label']}>{item.label}</span>
          ),
          children: (
            <span className={css['description-item-content']}>
              {item.children}
            </span>
          ),
        }))}
      />
    </div>
  );
}

export default ProfilesStatistics;
