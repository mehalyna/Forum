import MyModal from '../../pages/ProfilePage/UI/MyModal/MyModal';
import classes from './AdminModerationModal.module.css';

export function AdminModerationModal({ modalVisible, moderationStatus, closeModal }) {

  return (
    <MyModal visible={modalVisible}>
        <div className={classes['modal__content']}>{moderationStatus}</div>
        <div className={classes['modal__footer']}>
            <div className={classes['button-container']}>
                <button className={classes['modal__button']} onClick={closeModal}>
                    Закрити
                </button>
            </div>
        </div>
    </MyModal>
  );
}
