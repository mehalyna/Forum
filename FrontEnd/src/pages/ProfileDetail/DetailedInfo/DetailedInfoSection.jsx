import { PropTypes } from 'prop-types';

import DataContacts from './DataContacts/DataContacts';
import EmptyData from '../ProfileDetailComponents/EmptyData';
import Company from './DetailedInfoComponents/Company';
import Startup from './DetailedInfoComponents/Startup';
import ProductsServices from './DetailedInfoComponents/ProductsServices';

import classes from './DetailedInfoSection.module.css';


function DetailedInfoSection({ isAuthorized, data, containsNotRequiredData }) {
  return (
    <div className={classes['detail-info-page_block']}>
      <div className={classes['detail-info-page']}>
        <h3 className={classes['profile-detail__tags-mobile']}>Про Компанію</h3>
        <DataContacts isAuthorized={isAuthorized} data={data} />
        {containsNotRequiredData ?
          <div className={classes['company-description-block']}>
            <h3 className={classes['profile-detail__tags-desktop']}>Про Компанію</h3>
            <Company data={data} />
            {data.is_startup && <Startup data={data} />}
            {data.is_registered && <ProductsServices data={data} />}
          </div>
          : <EmptyData />}
      </div>
    </div>
  );
}

export default DetailedInfoSection;

DetailedInfoSection.propTypes = {
  isAuthorized: PropTypes.bool,
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    common_info: PropTypes.string,
    startup_idea: PropTypes.string,
    product_info: PropTypes.string,
    service_info: PropTypes.string,
    address: PropTypes.string,
  }),
  containsNotRequiredData: PropTypes.bool.isRequired,
};
