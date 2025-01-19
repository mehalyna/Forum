import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import AccordionItem from './AccordionItem';
import MyModal from '../UI/MyModal/MyModal';
import WarnUnsavedDataModal from '../FormComponents/WarnUnsavedDataModal';
import { DirtyFormContext } from '../../../context/DirtyFormContext';

const Accordion = ({ sections, openSection, setOpenSection }) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const { formIsDirty, setFormIsDirty } = useContext(DirtyFormContext);
  const [pendingSection, setPendingSection] = useState(null);

  const focusFirstUnfilledField = (sectionTitle) => {
    setTimeout(() => {
      const escapedTitle = CSS.escape(sectionTitle);
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

  const handleSectionClick = (sectionTitle) => {
    if (formIsDirty) {
      setPendingSection(sectionTitle);
      setShowWarningModal(true);
    } else {
      setOpenSection(openSection === sectionTitle ? null : sectionTitle);
      focusFirstUnfilledField(sectionTitle);
    }
  };

  const onConfirmModal = () => {
    setShowWarningModal(false);
    setFormIsDirty(false);
    setOpenSection(pendingSection);
    focusFirstUnfilledField(pendingSection);
  };

  const onCancelModal = () => {
    setShowWarningModal(false);
    setPendingSection(null);
  };

  return (
    <>
      <div className="accordion">
        {sections.map((section) => (
          <AccordionItem
            key={section.title}
            title={section.title}
            content={section.content}
            disabled={section.disabled}
            isOpen={openSection === section.title}
            onClick={() => handleSectionClick(section.title)}
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
