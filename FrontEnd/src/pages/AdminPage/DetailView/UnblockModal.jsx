import css from './UnblockModal.module.css';
import PropTypes from 'prop-types';

function UnblockModal({ active, setActive, onUnblock }) {

    const onBlockClick = async () => {
        await onUnblock();
        setActive(false);
    };

    return !active ? null : (
        <div
            className={`${css['modal-cover']} ${active && css['active']}`}
            onClick={() => setActive(false)}
        >
            <div className={css['modal-content']}>
                <p className={css['cookie-text']}>
                    Впевнені, що хочете розблокувати цей запис?
                </p>
                <button className={css['green-button']} onClick={() => setActive(false)}>
                    Скасувати
                </button>
                <button className={css['red-button']} onClick={onBlockClick}>
                    Розблокувати
                </button>
            </div>
        </div>
    );
}

UnblockModal.propTypes = {
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUnblock: PropTypes.func.isRequired
};
export default UnblockModal;

