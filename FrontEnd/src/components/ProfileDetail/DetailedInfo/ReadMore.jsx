import { useState } from 'react';
import { Typography } from 'antd';
import { PropTypes } from 'prop-types';
import classes from './ReadMore.module.css';

const { Paragraph } = Typography;

const ReadMore = ({ children }) => {
  const text = children;
  const [ellipsis, setEllipsis] = useState(true);

  const toggleReadMore = () => {
    setEllipsis(!ellipsis);
  };

  const ellipsisSymbol = ellipsis ? (
    <span className={classes['read-more-symbol']} onClick={toggleReadMore}>
    читати далі
    </span>
  ) : null;

  return (
    <Paragraph
      className={classes['read-more']}
      onClick={toggleReadMore}
      ellipsis={
        ellipsis
          ? {
              rows: 6,
              expandable: true,
              symbol: ellipsisSymbol,
            }
          : false
      }
    >
      {text}
    </Paragraph>
  );
};

export default ReadMore;

ReadMore.propTypes = {
  children: PropTypes.string,
};
