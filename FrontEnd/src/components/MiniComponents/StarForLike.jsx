import { StarOutlined, StarFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';

import styles from './StarForLike.module.css';

export default function StarForLike({
  isSaved,
  isAuthorized,
  ownProfile,
  handleClick,
  styleFilled,
  styleOutlined,
  location,
}) {
  const filledStar = (
    <StarFilled
      className={styles['star-filled']}
      onClick={handleClick}
      data-testid="star"
      style={styleFilled}
    />
  );
  const outlinedStar = (
    <StarOutlined
      className={styles['star-outlined']}
      onClick={handleClick}
      data-testid="emptystar"
      style={styleOutlined}
    />
  );

  const getStar = (isAuthorized, ownProfile, isSaved, location) => {
    if (isAuthorized && !ownProfile) {
      if (isSaved) {
        return location !== 'profilePage' ? filledStar : outlinedStar;
      } else {
        return outlinedStar;
      }
    }
    return null;
  };

  return getStar(isAuthorized, ownProfile, isSaved, location);
}

StarForLike.propTypes = {
  location: PropTypes.string,
  isSaved: PropTypes.bool,
  isAuthorized: PropTypes.bool,
  ownProfile: PropTypes.bool,
  handleClick: PropTypes.func,
  styleFilled: PropTypes.object,
  styleOutlined: PropTypes.object,
};
