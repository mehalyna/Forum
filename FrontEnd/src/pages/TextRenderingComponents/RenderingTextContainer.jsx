import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';

const RenderingTextContainer = ({ item, styles }) => {
  const renderParagraph = () => (
    <p
      className={styles['text_content']}
      key={item.id || uuidv4()}
      id={item.sectionId || null}
    >
      {item.text}
    </p>
  );

  const renderHeading = () => {
    const HeadingTag = `h${item.level}`;
    return (
      <HeadingTag
        className={styles['text_content__heading']}
        key={item.id || uuidv4()}
        id={item.sectionId || null}
      >
        {item.text}
      </HeadingTag>
    );
  };

  const renderParagraphMarginBottom = () => (
    <p
      className={styles['text_content__margin_bottom']}
      key={item.id || uuidv4()}
      id={item.sectionId || null}
    >
      {item.text}
    </p>
  );

  const renderListItem = () => (
    <ul
      key={item.id || uuidv4()}
      className={styles['custom-list']}
      id={item.sectionId || null}
    >
      <li className={styles['custom-list__item']}>{item.text}</li>
    </ul>
  );

  let element = null;

  switch (item.type) {
    case 'paragraph':
      element = renderParagraph();
      break;
    case 'heading':
      element = renderHeading();
      break;
    case 'paragraph__margin_bottom':
      element = renderParagraphMarginBottom();
      break;
    case 'list-item':
      element = renderListItem();
      break;
    default:
      break;
  }

  return element;
};

RenderingTextContainer.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    level: PropTypes.number,
    sectionId: PropTypes.string,
  }).isRequired,
  styles: PropTypes.object.isRequired,
};

export default RenderingTextContainer;
