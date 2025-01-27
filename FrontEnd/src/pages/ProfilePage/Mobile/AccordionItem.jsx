import PropTypes from 'prop-types';
import css from './AccordionItem.module.css';

const AccordionItem = (props) => {
    return (
        <div className={css['accordion-item']}>
            <button className={`${css['accordion-button']} ${props.disabled ? css['disabled'] : ''}`}
                    onClick={props.onClick}
                    >
                <p className={props.title === 'Видалити профіль' ? css['danger'] : ''}>
                    {props.title}
                </p>
               {!props.disabled && <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/arrow-${props.isOpen ? 'up' : 'down'}.svg`}></img>}
            </button>
            <div className={css['divider']}></div>
            <div key={props.triggerKey} className={`${css['accordion-content']} ${props.isOpen ? '' : css['close']}`}>
                {props.content}
            </div>
        </div>
    );
};

AccordionItem.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    triggerKey: PropTypes.number,
};

export default AccordionItem;
