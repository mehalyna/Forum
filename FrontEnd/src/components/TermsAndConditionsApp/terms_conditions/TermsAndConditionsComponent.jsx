import styles from './TermsAndConditionsComponent.module.css';
import TermsAndConditionsText from './text';
import TEXT_CONTENT from './text';
import renderContent from '../../../pages/TextRenderingComponents/RenderContent.jsx';
import useScrollToTop from '../../../hooks/useScrollToTop';


const TermsAndConditions = () => {
  useScrollToTop();

  return (
    <div className={styles['TermsAndConditions']}>
      <div className={styles['TermsAndConditions__text_container']}>
        <h2 className={styles['TermsAndConditions__title']}>{TermsAndConditionsText.title} </h2>
        {renderContent(TEXT_CONTENT)}
      </div>
    </div>
  );
};

export default TermsAndConditions;
