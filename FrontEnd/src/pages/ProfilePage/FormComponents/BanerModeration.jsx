import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './BanerModeration.css';

const BanerModeration = () => {
  const [moderationTime, setModerationTime] = useState(12);

  useEffect(() => {
    const fetchModerationTime = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/admin/automoderation/`);
        setModerationTime(response.data.auto_moderation_hours);
      } catch (error) {
        console.error('Error fetching moderation time:', error);
      }
    };

    fetchModerationTime();
  }, []);

  return (
    <div className="moderation-container">
      <div className="moderation-warning">
        <Tooltip>
          <div className="warning-icon">
            <ExclamationCircleOutlined />
          </div>
        </Tooltip>
        <div className="moderation-text">
          <span>Контент, доданий до банера, логотипа, буде підлягати модерації.</span>
          <span>Після затвердження модератором контент стане доступним усім користувачам сайту.</span>
          <span>Час модерації - до {moderationTime} годин. Якщо запит не буде розглянуто впродовж цього часу, то зміни автоматично будуть вважатись затвердженими.</span>
          <br />
          <span className="attention">Увага: Профіль буде заблоковано, якщо доданий контент має непристойний зміст.</span>
          <span>Максимально можна завантажити лише 30 зображень на день.</span>
        </div>
      </div>
    </div>
  );
};

export default BanerModeration;
