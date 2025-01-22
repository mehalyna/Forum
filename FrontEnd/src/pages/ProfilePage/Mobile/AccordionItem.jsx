import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import css from './AccordionItem.module.css';
import { DirtyFormContext } from '../../../context/DirtyFormContext';

const AccordionItem = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { formIsDirty } = useContext(DirtyFormContext);

    useEffect(() => {
        setIsOpen(props.isOpen);
    }, [props.isOpen]);

    const toggle = () => {
        if (!props.disabled) {
            formIsDirty ? props.warningHandler() : props.onClick();
        }
    };

    return (
        <div className={css['accordion-item']}>
            <button className={`${css['accordion-button']} ${props.disabled ? css['disabled'] : ''}`}
                    onClick={toggle}>
                <p className={props.title === 'Видалити профіль' ? css['danger'] : ''}>
                    {props.title}
                </p>
               {!props.disabled && (
                   <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/arrow-${isOpen ? 'up' : 'down'}.svg`} alt="Toggle" />
               )}
            </button>
            <div className={css['divider']}></div>
            <div className={`${css['accordion-content']} ${isOpen ? '' : css['close']}`}>
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
    warningHandler: PropTypes.func.isRequired,
};

export default AccordionItem;
