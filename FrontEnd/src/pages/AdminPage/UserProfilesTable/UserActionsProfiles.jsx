import { Tooltip} from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function UserActionsProfiles({ text, profile }) {
    const navigate = useNavigate();
    const viewProfile = () => {
        try {
            navigate(`/customadmin/profile/${profile.id}`);
        } catch (error) {
            toast.error('Не вдалося переглянути профіль. Спробуйте оновити сторінку.');
        }
    };

    return (
        <Tooltip title="Відкрити профіль">
             <a onClick={viewProfile}>
            {text} </a>
        </Tooltip>
    );
}

UserActionsProfiles.propTypes = {
    profile: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }).isRequired,
    onActionComplete: PropTypes.func,
};

export default UserActionsProfiles;
