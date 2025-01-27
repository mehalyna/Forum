import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import { AdminModerationModal } from './AdminModerationModal';
import classes from './AdminModerationActions.module.css';

const AdminModerationActions = ({ banner, logo, id, onModerationComplete }) => {
    const [moderationStatus, setModerationStatus] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const errorMessages = {
        'There is a new request for moderation. URL is outdated':
          'Помилка: профіль було повторно оновлено. Існує новіший запит на модерацію. Посилання застаріле.',
        'The change approval request has been processed. URL is outdated':
          'Помилка: запит на затвердження змін вже було опрацьовано. Посилання застаріле.',
        'At least one image (logo or banner) must be provided for the moderation request.':
          'Помилка: відсутні зображення на модерації. Запит вже було опрацьовано.'
      };

    const handleModeration = async (action) => {
        const data = {
            action,
            ...(!banner.is_approved && { banner: banner.uuid }),
            ...(!logo.is_approved && { logo: logo.uuid }),
          };
        try {
          await axios.patch(
            `${process.env.REACT_APP_BASE_API_URL}/api/profiles/${id}/images_moderation/`,
            data
          );
          action === 'approve'
            ? setModerationStatus('Зміни успішно затверджено')
            : setModerationStatus(
                'Зміни успішно скасовано. Профіль компанії заблоковано'
              );
          setModalVisible(true);
        } catch (error) {
          setModerationStatus('Помилка застосування змін');
          if (error.response && error.response.status === 400) {
            Object.keys(error.response.data).forEach((key) => {
              const message = error.response.data[key][0];
              if (errorMessages[message]) {
                setModerationStatus(errorMessages[message]);
              }
            });
          }
          setModalVisible(true);
        }
      };

    const closeModal = () => {
        onModerationComplete();
        setModalVisible(false);
      };

    return (
        <div className={classes['buttons-container']}>
            <button
                onClick={() => handleModeration('approve', banner, logo, id)}
                className={classes['button']}>
                    Затвердити
            </button>
            <Tooltip
                title="Профіль буде заблоковано"
                placement="top"
                pointAtCenter={true}
            >
                <button
                    onClick={() => handleModeration('reject', banner, logo, id)}
                    className={`${classes['button']} ${classes['button-reject']}`}>
                        Скасувати
                </button>
            </Tooltip>
            <AdminModerationModal moderationStatus={moderationStatus}  modalVisible={modalVisible} closeModal={closeModal} />
        </div>
    );
};

export default AdminModerationActions;

AdminModerationActions.propTypes = {
    banner: PropTypes.shape({
        uuid: PropTypes.string,
        is_approved: PropTypes.bool,
    }),
    logo: PropTypes.shape({
        uuid: PropTypes.string,
        is_approved: PropTypes.bool,
    }),
    id: PropTypes.string.isRequired,
    onModerationComplete: PropTypes.func.isRequired,
};
