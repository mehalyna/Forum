import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { Descriptions, Segmented, Select, DatePicker } from 'antd';
import Loader from '../../../components/Loader/Loader';
import css from './ProfilesStatistics.module.css';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;

async function fetcher(url) {
  const response = await axios.get(url);
  return response.data;
}

function ProfilesStatistics() {
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const [periodRange, setPeriodRange] = useState({ start_date: '', end_date: '' });
  const [periodType, setPeriodType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tab, setTab] = useState('overall');

  const queryParams = [];
  if (tab === 'period' && periodType !== 'range' && selectedDate) {
    queryParams.push(`${periodType}=${selectedDate}`);
  }
  if (tab === 'period' && periodType === 'range' && periodRange) {
    const params = new URLSearchParams(periodRange).toString();
    queryParams.push(params);
  }
  const url = `${baseUrl}/api/admin/profiles/statistics/${
    queryParams.length ? `?${queryParams.join('&')}` : ''
  }`;
  const activities_url = `${baseUrl}/api/admin/profiles/statistics-activities/`;

  const { data: statistics, error, isLoading } = useSWR(url, fetcher);
  const { data: activities, error: activitiesError, isLoading: activitiesLoading } = useSWR(activities_url, fetcher);

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
          label: 'Кількість Cтартапів',
          children: statistics.startups_count,
        },
        {
          key: '4',
          label: 'Кількість заблокованих компаній',
          children: statistics.blocked_companies_count,
        },
      ]
    : [];

  const handleDateChange = (value, dateString) => {
    setSelectedDate(dateString);
  };

  const handleRangeChange = (value, dateString) => {
    setPeriodRange({ start_date: dateString[0], end_date: dateString[1] });
  };
  const chartData = activities
  ?{
      labels: ['Виробники', 'Імпортери', 'Роздрібніки', 'HORECA', 'Інші'],
      datasets: [
          {
              label: 'Типи компаній',
              data: [
                  activities.manufacturers_count,
                  activities.importers_count,
                  activities.retail_networks_count,
                  activities.horeca_count,
                  activities.others_count
              ],
              backgroundColor: [
                  '#87f3b0',
              ]
          },
      ]
  }: { labels: [], datasets: [] };
  const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Статистика по типам компаній',
        },
      },
       maintainAspectRatio: false,
    };
  return (
      <div className={css['statistics-container']}>
          <p className={css['statistics-title']}>Статистика компаній</p>
          <Segmented
              className={css['segmented-container']}
              value={tab}
              options={[
                  {label: 'Загалом', value: 'overall'},
                  {label: 'Обрати період', value: 'period'},
              ]}
              onChange={(value) => {
                  setTab(value);
                  setPeriodType('');
                  setSelectedDate(null);
              }}
          />
          {tab === 'period' && (
              <div className={css['period-container']}>
                  <Select
                      placeholder="Оберіть тип періоду"
                      value={periodType === '' ? null : periodType}
                      onChange={(value) => {
                          setPeriodType(value);
                          setSelectedDate(null);
                          setPeriodRange({start_date: '', end_date: ''});
                      }}
                      dropdownStyle={{minWidth: '150px'}}
                  >
                      <Option value="range">Діапазон</Option>
                      <Option value="day">День</Option>
                      <Option value="month">Місяць</Option>
                      <Option value="year">Рік</Option>
                  </Select>
                  {periodType === 'range' && (
                      <DatePicker.RangePicker
                          onChange={handleRangeChange}
                          placeholder="Обрати"
                      />
                  )}
                  {periodType !== 'range' && (
                      <DatePicker
                          picker={periodType}
                          onChange={handleDateChange}
                          placeholder="Обрати"
                      />
                  )}
              </div>
          )}
          {isLoading && (
              <div className={css['loader-container']}>
                  <Loader/>
              </div>
          )}
          {error && (
              <div className={css['error']}>Не вдалося отримати статистику компаній</div>
          )}
          {!isLoading && !error && (
              <Descriptions
                  className={css['descriptions-container']}
                  column={1}
                  bordered
                  size="small"
                  items={items}
              />
          )}
          {activitiesLoading && (
              <div className={css['loader-container']}>
                  <Loader/>
              </div>
          )}
          {activitiesError && (
              <div className={css['error']}>Не вдалося отримати статистику компаній</div>
          )}
          {!activitiesLoading && !activitiesError && (
                <div className={css['chart-container']}>
                    <Bar options={options} data={chartData}/>
                </div>
            )
          }
      </div>
  );
}

export default ProfilesStatistics;
