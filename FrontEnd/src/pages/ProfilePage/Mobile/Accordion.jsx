import { useState, useContext, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import PropTypes from 'prop-types';
import AccordionItem from './AccordionItem';
import MyModal from '../UI/MyModal/MyModal';
import WarnUnsavedDataModal from '../FormComponents/WarnUnsavedDataModal';
import { DirtyFormContext } from '../../../context/DirtyFormContext';

const Accordion = ({ sections, openSectionIndex, setOpenSectionIndex }) => {
  const [previousSectionIndex, setPreviousSectionIndex] = useState(null);
  const [targetSectionIndex, setTargetSectionIndex] = useState(null);
  const [triggerKey, setTriggerKey] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const {  formIsDirty, setFormIsDirty } = useContext(DirtyFormContext);

  const blocker = useBlocker(
          ({ currentLocation, nextLocation }) =>
              formIsDirty &&
              currentLocation.pathname !== nextLocation.pathname
      );

      useEffect(() => {
          if (blocker.state === 'blocked') {
            setShowWarningModal(true);
          } else {
            setShowWarningModal(false);
          }
      }, [blocker.state]);

  const handleItemClick = (index, disabled) => {
    if (disabled) return;

    if (formIsDirty) {
        setShowWarningModal(true);
        setTargetSectionIndex(index);
      } else {
        setOpenSectionIndex((prev) => (prev === index ? null : index));
        focusFirstUnfilledField(index);
      }
    };

  const focusFirstUnfilledField = (index) => {
    setTimeout(() => {
      const escapedTitle = CSS.escape(index);
      const firstUnfilledField = document.querySelector(
        `#${escapedTitle} input:not([value]):not([disabled]),
         #${escapedTitle} textarea:not([value]):not([disabled])`
      );
      if (firstUnfilledField) {
        firstUnfilledField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstUnfilledField.focus();
      }
    }, 300);
  };

  const onConfirmModal = () => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setShowWarningModal(false);
    setFormIsDirty(false);
    setPreviousSectionIndex(openSectionIndex);
    setOpenSectionIndex(targetSectionIndex);
    setTriggerKey((prev) => prev + 1);
    focusFirstUnfilledField(openSectionIndex);
  };

  const onCancelModal = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowWarningModal(false);
  };

  return (
    <>
      <div className="accordion">
        {sections.map((section, index) => (
          <AccordionItem
            key={index}
            title={section.title}
            content={section.content}
            disabled={section.disabled}
            isOpen={openSectionIndex === index}
            triggerKey={previousSectionIndex === index ? triggerKey : null}
            onClick={() => handleItemClick(index, section.disabled)}
          />
        ))}
      </div>
      <MyModal visible={showWarningModal}>
        <WarnUnsavedDataModal onCancel={onCancelModal} onConfirm={onConfirmModal} />
      </MyModal>
    </>
  );
};

Accordion.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  openSectionIndex: PropTypes.number,
  setOpenSectionIndex: PropTypes.func.isRequired,
};

export default Accordion;
