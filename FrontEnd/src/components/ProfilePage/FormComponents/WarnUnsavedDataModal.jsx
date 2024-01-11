import classes from './WarnUnsavedDataModal.module.css';

const WarnUnsavedDataModal = ({ onCancel, onConfirm }) => {

    return (
        <div className={classes['modal']}>
            <div className={classes['modal-header']}>
                <p className={classes['modal-header--text']}>
                    Збереження введених даних
                </p>
                <button onClick={onCancel} className={classes['modal-header--close-icon']}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8.9257 7.99916L13.6132 2.41166C13.6918 2.31881 13.6257 2.17773 13.5043 2.17773H12.0793C11.9953 2.17773 11.915 2.21523 11.8596 2.27952L7.99356 6.88845L4.12749 2.27952C4.07392 2.21523 3.99356 2.17773 3.90784 2.17773H2.48284C2.36142 2.17773 2.29534 2.31881 2.37392 2.41166L7.06142 7.99916L2.37392 13.5867C2.35631 13.6074 2.34502 13.6327 2.34138 13.6596C2.33774 13.6865 2.3419 13.7139 2.35337 13.7386C2.36484 13.7632 2.38313 13.784 2.40608 13.7985C2.42903 13.8131 2.45568 13.8207 2.48284 13.8206H3.90784C3.99177 13.8206 4.07213 13.7831 4.12749 13.7188L7.99356 9.10988L11.8596 13.7188C11.9132 13.7831 11.9936 13.8206 12.0793 13.8206H13.5043C13.6257 13.8206 13.6918 13.6795 13.6132 13.5867L8.9257 7.99916Z" fill="black" fillOpacity="0.45"/>
                    </svg>
                </button>
            </div>
            <div className={classes['modal-content']}>
                <p className={classes['modal-content--text']}>
                    Ввдені дані не є збережені. При переході на іншу сторінку вони будуть втрачені. Перейти на іншу сторінку?
                </p>
            </div>
            <div className={classes['modal-footer']}>
                <div className={classes['modal-footer--buttons-wrapper']}>
                    <button onClick={onCancel} className={`${classes['modal-footer--button']} ${classes['modal-footer--button-cancel']}`}>
                        Скасувати
                    </button>
                    <button onClick={onConfirm} className={`${classes['modal-footer--button']} ${classes['modal-footer--button-continue']}`}>
                        Продовжити
                    </button>
                </div>
            </div>

        </div>
    );
};

export default WarnUnsavedDataModal;