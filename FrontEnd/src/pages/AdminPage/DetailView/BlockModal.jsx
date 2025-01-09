import css from './DeleteModal.module.css';
import PropTypes from 'prop-types';

function BlockModal({ active, setActive, onBlock }) {

    const onBlockClick = async () => {
        await onBlock();
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
                <button className={css['red-button']} onClick={onBlockClick}>
                    Заблокувати
                </button>
            </div>
        </div>
    );
}

BlockModal.propTypes = {
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onBlock: PropTypes.func.isRequired
};
export default BlockModal;

