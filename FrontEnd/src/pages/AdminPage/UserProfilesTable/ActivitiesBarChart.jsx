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
import axios from 'axios';
import useSWR from 'swr';
import Loader from '../../../components/Loader/Loader';
import css from './ActivitiesBarChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

async function fetcher(url) {
  const response = await axios.get(url);
  return response.data;
}

function ActivitiesBarChart() {
    const baseUrl = process.env.REACT_APP_BASE_API_URL;
    const activities_url = `${baseUrl}/api/admin/profiles/statistics-activities/`;
    const { data: activities, error: activitiesError, isLoading: activitiesLoading } = useSWR(activities_url, fetcher);
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
      <div className={css['chart-container']}>
        {activitiesLoading && (
              <div className={css['loader-container']}>
                  <Loader/>
              </div>
          )
        }
        {activitiesError && (
            <div className={css['error']}>Не вдалося отримати статистику компаній</div>
          )
        }
        {!activitiesLoading && !activitiesError && (
            <Bar options={options} data={chartData}/>
              )
        }
      </div>
  );
}

export default ActivitiesBarChart;