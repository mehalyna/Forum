import { useState } from 'react';
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
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import Loader from '../../../components/Loader/Loader';
import css from './ProfileChart.module.css';


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

function ProfilesBarChart() {
    const [selectedYear, setselectedYear] = useState(new Date().getFullYear());
    const baseUrl = process.env.REACT_APP_BASE_API_URL;
    const year = selectedYear ? `?year=${selectedYear}` : '';
    const url = `${baseUrl}/api/admin/profiles/statistics/monthly/${year}`;
    const { data: statistics, error, isLoading } = useSWR(url, fetcher);

    const getDataByKey = (dataUsers, labels, key) => {
        return labels.map((monthName, index) => {
          const dataForMonth = statistics.find((user) => user.month === index + 1);
          return dataForMonth ? dataForMonth[key] : 0;
        });
    };

    const handleYearChange = (value, dateString) => {
        setselectedYear(dateString);
      };

    const labels = [
        'Січень',
        'Лютий',
        'Березень',
        'Квітень',
        'Травень',
        'Червень',
        'Липень',
        'Серпень',
        'Вересень',
        'Жовтень',
        'Листопад',
        'Грудень',
      ];

    const data = statistics
        ? {
            labels,
            datasets: [
            {
                label: 'Інвестори',
                data: getDataByKey(statistics, labels, 'investors_count'),
                backgroundColor: '#1F9A7C',
            },
            {
                label: 'Стартапи',
                data: getDataByKey(statistics, labels, 'startups_count'),
                backgroundColor: '#B4D27A',
            },
            {
                label: 'Стартапи та Інвестори',
                data: getDataByKey(statistics, labels, 'startup_investor_count'),
                backgroundColor: 'rgba(182, 212, 99, 0.5)',
            },
            ],
        } : {labels: [], datasets: []};

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Графік реєстрації компаній',
          },
        },
        scales: {
            y: {
              ticks: {
                stepSize: 1,
              },
            },
        },
    };
    return (
        <div className={css['profiles-chart']}>
            <DatePicker
                className={css['profiles-chart__datepicker']}
                onChange={handleYearChange}
                picker="year"
                defaultValue={dayjs().year(new Date().getFullYear())}
                allowClear={false}
            />
            {isLoading && (
                <div className={css['loader-container']}>
                    <Loader />
                </div>
            )}
            {error && (
                <div className={css['error']}>Не вдалося отримати статистику компаній</div>
            )}
            <Bar options={options} data={data} />
        </div>
    );
}

export default ProfilesBarChart;
