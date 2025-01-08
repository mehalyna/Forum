import css from './DeleteModal.module.css';
import PropTypes from 'prop-types';

function DeleteModal({ active, setActive, onDelete }) {

    const onDeleteClick = async () => {
        await onDelete();
        setActive(false);
    };

    return !active ? null : (
        <div
            className={`${css['modal-cover']} ${active && css['active']}`}
            onClick={() => setActive(false)}
        >
            <div className={css['modal-content']}>
                <p className={css['cookie-text']}>
                    Впевнені, що хочете заблокувати цей запис?
                </p>
                <button className={css['green-button']} onClick={() => setActive(false)}>
                    Скасувати
                </button>
                <button className={css['red-button']} onClick={onDeleteClick}>
                    Заблокувати
                </button>
            </div>
        </div>
    );
}

DeleteModal.propTypes = {
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
export default DeleteModal;

