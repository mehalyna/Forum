import { useMemo, useEffect, useContext } from 'react';
import { PropTypes } from 'prop-types';

import { ActiveLinksContext } from '../../../../context/ActiveLinksContext';

import classes from './Startup.module.css';


function Startup({ data }) {
  const { setActiveLinks } = useContext(ActiveLinksContext);
  const profile = useMemo(() => {
    return {
      idea: data.startup_idea,
    };
  }, [data]);


  useEffect(() => {
    if (profile.idea) {
      setActiveLinks(prevData => [
        ...prevData,
        'startup']);
    }
  }, [profile.idea, setActiveLinks]);

  return (
    profile.idea ? (
      <div id="startup" className={classes['startup-wrapper']}>
        <h3 className={classes['startup__title--text']}>Стартап</h3>
        <div className={classes['startup__content--block']}>
            <span className={classes['startup__content--title']}>Ідея стартапу: </span>
            {profile.idea}
        </div>
      </div>
    ) : null
  );
}

export default Startup;

Startup.propTypes = {
  data: PropTypes.shape({
    startup_idea: PropTypes.string,
  }),
};