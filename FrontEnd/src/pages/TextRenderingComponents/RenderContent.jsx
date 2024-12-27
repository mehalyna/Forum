import { v4 as uuidv4 } from 'uuid';
import ContentRenderer from './RenderingTextContainer.jsx';
import styles from './textAndNavigation.module.css';

const renderContent = (Text) => (
  Text.content.map((item) => (
    <ContentRenderer
      key={item.id || uuidv4()}
      item={item}
      styles={styles}
      id={item.sectionId || null}
    />
  ))
);

export default renderContent;
