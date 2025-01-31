import { PropTypes } from 'prop-types';
import { useEffect, useContext } from 'react';

import { ActiveLinksContext } from '../../../../context/ActiveLinksContext';

import classes from './Company.module.css';

function Company({ data }) {
    const { setActiveLinks } = useContext(ActiveLinksContext);
    const companyData = data.common_info ;

    useEffect(() => {
        if (companyData) {
            setActiveLinks(prevData => [
                ...prevData,
                'about-company',
            ]);
        }
    }, [setActiveLinks, companyData]);

    return (
        companyData ? (
            <div id="about-company" className={classes['about-company']}>
                    {data.common_info ? (
                        <div className={classes['about-company__content']}>
                            {data.common_info}
                        </div>
                    ) : null}
                </div>
        ) : null
    );
}

export default Company;

Company.propTypes = {
    data: PropTypes.shape({
        common_info: PropTypes.string,
    }),
};
