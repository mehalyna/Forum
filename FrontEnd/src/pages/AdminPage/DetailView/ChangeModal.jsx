import css from './BlockModal.module.css';
import PropTypes from 'prop-types';

function ChangeModal({ active, setActive, onChange, action }) {

    const onChangeClick = async () => {
        await onChange(action);
        setActive(false);
    };

    return !active ? null : (
        <div
            className={`${css['modal-cover']} ${active && css['active']}`}
            onClick={() => setActive(false)}
        >
            <div className={css['modal-content']}>
                {action === 'block' ?
                    <div>
                        <p className={css['cookie-text']}>
                            Впевнені, що хочете заблокувати цей запис?
                        </p>
                        <button className={css['green-button']} onClick={() => setActive(false)}>
                            Скасувати
                        </button>
                        <button className={css['red-button']} onClick={onChangeClick}>
                            Заблокувати
                        </button>
                    </div>
                    :
                    <div>
                        <p className={css['cookie-text']}>
                            Впевнені, що хочете розблокувати цей запис?
                        </p>
                        <button className={css['green-button']} onClick={() => setActive(false)}>
                            Скасувати
                        </button>
                        <button className={css['red-button']} onClick={onChangeClick}>
                            Розблокувати
                        </button>
                    </div>
                }


            </div>
        </div>
    );
}

ChangeModal.propTypes = {
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    action: PropTypes.string.isRequired
};
export default ChangeModal;

