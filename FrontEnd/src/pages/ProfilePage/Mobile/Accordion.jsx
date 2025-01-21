import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AccordionItem from './AccordionItem';
import MyModal from '../UI/MyModal/MyModal';
import WarnUnsavedDataModal from '../FormComponents/WarnUnsavedDataModal';
import { DirtyFormContext } from '../../../context/DirtyFormContext';

const Accordion = ({ sections }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);
  const [triggerKey, setTriggerKey] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const {  formIsDirty, setFormIsDirty } = useContext(DirtyFormContext);

  const handleItemClick = (index, disabled) => {
    if (disabled) return;

    if (!formIsDirty) {
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
        focusFirstUnfilledField(index);
        } else {
          setShowWarningModal(true);
          setTargetIndex(index);
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
    setShowWarningModal(false);
    setFormIsDirty(false);
    setPreviousIndex(activeIndex);
    setActiveIndex(targetIndex);
    setTriggerKey((prev) => prev + 1);
    focusFirstUnfilledField(activeIndex);
  };

  const onCancelModal = () => {
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
            isOpen={activeIndex === index}
            triggerKey={previousIndex === index ? triggerKey : null}
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
  sections: PropTypes.array.isRequired,
  openSection: PropTypes.string,
  setOpenSection: PropTypes.func.isRequired,
};

export default Accordion;
