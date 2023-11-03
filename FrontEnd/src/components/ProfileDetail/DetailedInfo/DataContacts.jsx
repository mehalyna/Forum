import React from 'react';
import { PropTypes } from 'prop-types';
import PhoneEmail from './PhoneEmail';
import classes from './DataContacts.module.css';

function DataContacts ({ isAuthorized, data }) {

    // TODO: implement logic for getting data from db when it's added on server side

    const companyData = {
        'ЄДРПОУ': data.edrpou,
        'Рік заснування': data.founded,
        'Розмір компанії': '',
        'Аудит': ''
    };

    const companyContacts = {
        'Сайт': '',
        'PhoneEmail': <PhoneEmail isAuthorized={isAuthorized} profileId={data.id}/>,
        'Адрес(и)': data.address,
        'Соціальні мережі': [
            {
                name: 'facebook',
                url: 's',
                svgPath: <img src={`${process.env.PUBLIC_URL}/svg/facebook.svg`} />,
            },
            {
                name: 'instagram',
                url: 'a',
                svgPath: <img src={`${process.env.PUBLIC_URL}/svg/instagram.svg`} />,
            },
        ],
        'Співпрацюємо з': ''
    };

    const hasSocialLinks = companyContacts['Соціальні мережі'].filter(socialLink => socialLink.url !== '').length > 0;

    const renderedDataSections = Object.entries(companyData).map(([key, value]) => {
        const className = key === 'ЄДРПОУ' ? `${classes['data-block__field']} ${classes['edrpou']}` : classes['data-block__field'];
        if (value) {
          return (
            <div key={key} className={className}>
              <p className={classes['data-block__field--title']}>{key}</p>
              <p className={classes['data-block__field--value']}>
                {value}
              </p>
            </div>
          );
        }
        return null;
      });

    const hasDataSections = renderedDataSections.some((section) => section !== null);

    const renderedContactSections = Object.entries(companyContacts).map(([key, value]) => {
        if (value) {
          if (key === 'Соціальні мережі') {
            return (
              hasSocialLinks ?
              (<div key={key} className={classes['data-block__field--social-networks']}>
                <p className={classes['data-block__field--title']}>{key}</p>
                  {value.map((contact, index) => {
                    if (contact.url) {
                      return (
                        <a key={index} href={contact.url}>
                          {contact.svgPath}
                        </a>
                      );
                    }
                  return null;
                })}
              </div>) : null
            );
          } else if (key === 'PhoneEmail') {
            return (
                <React.Fragment key={key}>
                  {value }
                </React.Fragment>);
          } else {
            const className = key === 'Адрес(и)' ? classes['data-block__field--address'] : classes['data-block__field'];
            const valueClassName = key === 'Сайт' ? classes['data-block__field--site'] : classes['data-block__field--value'];
            return (
              <div key={key} className={className}>
                <p className={classes['data-block__field--title']}>{key}</p>
                <p className={valueClassName}>{value}</p>
              </div>
            );
        }
      }
      return null;
    });

    const hasContactSections = renderedContactSections.some((section) => section !== null);

    return (
        <div className={classes['data-wrapper']}>
            <div className={classes['data']}>
                {hasDataSections ? (
                    <div className={classes['data-block']}>
                        {renderedDataSections}
                    </div>
                ) : null}
                {hasContactSections ? (
                    <div className={classes['data-block']}>
                        {renderedContactSections}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default DataContacts;

DataContacts.propTypes = {
  isAuthorized: PropTypes.bool,
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    edrpou: PropTypes.number,
    founded: PropTypes.number,
    address: PropTypes.string,
  }),
};
