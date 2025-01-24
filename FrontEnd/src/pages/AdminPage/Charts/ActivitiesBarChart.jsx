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
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
import { Bar } from 'react-chartjs-2';
import css from './ActivitiesBarChart.module.scss';
import Loader from '../../../components/Loader/Loader';


function ActivitiesBarChart({statistics, isLoading, error}) {
    const chartData = statistics
        ? {
            labels: ['Виробники', 'Імпортери', 'Роздрібніки', 'HORECA', 'Інші'],
            datasets: [
                {
                    label: 'Типи компаній',
                    data: [
                        statistics.manufacturers_count,
                        statistics.importers_count,
                        statistics.retail_networks_count,
                        statistics.horeca_count,
                        statistics.others_count
                    ],
                    backgroundColor: [
                        '#87f3b0',
                    ]
                },
            ]
        } : {labels: [], datasets: []};
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
            scales: {
            y: {
                ticks: {
                    stepSize: 1,
                },
            },
    },
        },
    };
    return (
        <div className={css['chart-container']}>
            {isLoading && (
                <div className={css['loader-container']}>
                    <Loader/>
                </div>
            )
            }
            {error && (
                <div className={css['error']}>Не вдалося отримати статистику компаній</div>
            )
            }
            {!isLoading && !error && (
                <Bar data={chartData} options={options}/>
            )
            }
        </div>
    );
}

export default ActivitiesBarChart;