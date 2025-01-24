import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import classes from './ModerationAdminButtons.module.css';

const ModerationAdminButtons = ({ banner, logo, id }) => {
    const [params, setParams] = useState('');

    const createQueryParams = (banner, logo) => {
        const queryParams = {};
        if (banner) {
            queryParams.banner = banner.uuid;
        }
        if (logo) {
            queryParams.logo = logo.uuid;
        }
        return new URLSearchParams(queryParams).toString();
    };

    useEffect(() => {
        const queryParams = createQueryParams(banner, logo);
        setParams(queryParams);
    }, []);

    return (
        <div className={classes['buttons-container']}>
            <Link to={`${process.env.REACT_APP_PUBLIC_URL}/moderation/${id}/approve/?${params}`}
                className={classes['button']}>
                    Затвердити
            </Link>
            <Tooltip
                title="Профіль буде заблоковано"
                placement="top"
                pointAtCenter={true}
            >
                <Link to={`${process.env.REACT_APP_PUBLIC_URL}/moderation/${id}/reject/?${params}`}
                    className={`${classes['button']} ${classes['button-reject']}`}>
                        Скасувати
                </Link>
            </Tooltip>
        </div>

    );
};

export default ModerationAdminButtons;

ModerationAdminButtons.propTypes = {
    banner: PropTypes.shape({
        uuid: PropTypes.string,
    }),
    logo: PropTypes.shape({
        uuid: PropTypes.string,
    }),
    id: PropTypes.number.isRequired,
};
