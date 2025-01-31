import { useMemo, useEffect, useContext } from 'react';
import { PropTypes } from 'prop-types';
import { ActiveLinksContext } from '../../../../context/ActiveLinksContext';

import classes from './ProductsServices.module.css';


function ProductsServices({ data }) {
    const { setActiveLinks } = useContext(ActiveLinksContext);
    const profile = useMemo(() => {
        return {
            products: data.product_info,
            services: data.service_info
        };
    }, [data]);

    useEffect(() => {
        if (profile.products || profile.services) {
            setActiveLinks(prevData => [
                ...prevData,
                'products-services']);
        }
    }, [setActiveLinks, profile.products, profile.services]);

    return (
        (profile.products || profile.services) ? (
            <div id="products-services" className={classes['products-services']}>
                <h3 className={classes['products-services__title--text']}>Інформація про товари/послуги</h3>
                <div className={classes['products-services__content--block']}>
                    {profile.products &&
                        <div className={classes['products-services__content--text']}>
                            <span className={classes['products-services__content--title']}>Товари: </span>
                            {profile.products}
                        </div>}
                    {profile.services &&
                        <div className={classes['products-services__content--text']}>
                            <span className={classes['products-services__content--title']}>Послуги: </span>
                            {profile.services}
                        </div>}
                </div>
            </div>
        ) : null
    );
}

export default ProductsServices;

ProductsServices.propTypes = {
    data: PropTypes.shape({
        product_info: PropTypes.string,
        service_info: PropTypes.string,
    })
};
