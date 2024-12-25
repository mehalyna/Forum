import PropTypes from 'prop-types';
import classes from './WarnImageDeleteModal.module.css';

const WarnImageDeleteModal = ({ onCancel, onDelete }) => {

    return (
        <div className={classes['modal']}>
            <div className={classes['modal-header']}>
                <p className={classes['modal-header--text']}>
                    Ви впевнені, що хочете видалити зображення?
                </p>
                <button onClick={onCancel} className={classes['modal-header--close-icon']}>
                    <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cross-btn.svg`} alt="Cancel button" />
                </button>
            </div>
            <div className={classes['modal-content']}>
                <p className={classes['modal-content--text']}>
                    Цю дію не можна буде відмінити.
                </p>
            </div>
            <div className={classes['modal-footer']}>
                <div className={classes['modal-footer--buttons-wrapper']}>
                    <button
                        onClick={onDelete}
                        type="button"
                        className={`${classes['modal-footer--button']} ${classes['modal-footer--button-delete']}`}
                    >
                        Видалити
                    </button>
                    <button
                        onClick={onCancel}
                        type="button"
                        className={`${classes['modal-footer--button']} ${classes['modal-footer--button-cancel']}`}
                    >
                        Скасувати
                    </button>
                </div>
            </div>

        </div>
    );
};

WarnImageDeleteModal.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default WarnImageDeleteModal;
