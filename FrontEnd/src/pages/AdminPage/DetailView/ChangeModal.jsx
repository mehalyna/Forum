import css from './ChangeModal.module.scss';
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
                    </div>
                    :
                    <div>
                        <p className={css['cookie-text']}>
                            Впевнені, що хочете розблокувати цей запис?
                        </p>
                    </div>
                }
                <div className={css['buttons-group']}>
                    <button className={`${css['save-button']} ${css['cancel-button']}`} onClick={() => setActive(false)}>
                        Скасувати
                    </button>
                    <button className={css['save-button']} onClick={onChangeClick}>
                        Прийняти
                    </button>
                </div>

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

