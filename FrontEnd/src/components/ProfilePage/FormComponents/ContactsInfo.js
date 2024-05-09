import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { DirtyFormContext } from  '../../../context/DirtyFormContext';
import { useAuth, useProfile } from '../../../hooks/';
import checkFormIsDirty from '../../../utils/checkFormIsDirty';
import FullField from './FormFields/FullField';
import HalfFormField from './FormFields/HalfFormField';
import Loader from '../../loader/Loader';
import css from './FormComponents.module.css';

const LABELS = {
    'phone': 'Телефон',
    'address': 'Поштова адреса',
};

const ContactsInfo = (props) => {
    const { user } = useAuth();
    const { profile: mainProfile, mutate: profileMutate } = useProfile();
    const [profile, setProfile] = useState(props.profile);
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const { setFormIsDirty } = useContext(DirtyFormContext);

    // TODO: update default values as new fields added

    const fields = {
        'phone': {defaultValue: mainProfile?.phone ?? null},
        'address': {defaultValue: mainProfile?.address ?? null},
    };

    useEffect(() => {
        const isDirty = checkFormIsDirty(fields, null, profile);
        setFormIsDirty(isDirty);
      }, [mainProfile, profile]);

    useEffect(() => {
        props.currentFormNameHandler(props.curForm);
    }, []);

    const onUpdateField = e => {
        setProfile((prevState) => {
            return { ...prevState, [e.target.name]: e.target.value };
        });
    };

    const onUpdatePhoneNumberField = e => {
        const receivedPhoneNumber = e.target.value;
        const parsedNumber = Number(receivedPhoneNumber);
        const isInteger = Number.isInteger(parsedNumber);
        if (isInteger) {
            if (receivedPhoneNumber && receivedPhoneNumber.length !== 12) {
                setPhoneNumberError('Номер повинен містити 12 цифр');
            } else {
                setPhoneNumberError(null);
            }
        } else {
            setPhoneNumberError('Номер повинен містити лише цифри');
        }
        setProfile((prevState) => {
            return { ...prevState, [e.target.name]: e.target.value };
        });
    };

    const validateForm = () => {
        let isValid = true;
        if (profile.phoneNumber &&
            (profile.phoneNumber.length !== 12 || !Number.isInteger(Number(profile.phoneNumber)))) {
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            toast.error('Зміни не можуть бути збережені, перевірте правильність заповнення полів');
        } else {
            try {
                const response = await axios.patch(`${process.env.REACT_APP_BASE_API_URL}/api/profiles/${user.profile_id}`, {
                    phone: profile.phone,
                    address: profile.address,
                    },
                );
                const updatedProfileData = response.data;
                profileMutate(updatedProfileData);
                setFormIsDirty(false);
                toast.success('Зміни успішно збережено');
            }
            catch (error) {
                console.error('Помилка:', error.response ? error.response.data : error.message);
                if (!error.response || error.response.status !== 401) {
                    toast.error('Не вдалося зберегти зміни, сталася помилка');
                }
            }
        }
    };

    return (
        <div className={css['form__container']}>
            {(user && profile && mainProfile)
                ?

                <form id="ContactsInfo" onSubmit={handleSubmit} autoComplete="off" noValidate>
                    <div className={css['fields']}>
                        <div className={css['fields-groups']}>
                            <HalfFormField
                                inputType="tel"
                                name="phone"
                                fieldPlaceholder="38"
                                label={LABELS.phone}
                                updateHandler={onUpdatePhoneNumberField}
                                requredField={false}
                                value={profile.phone ?? ''}
                                error={phoneNumberError}
                            />
                        </div>
                        <FullField
                            name="address"
                            label={LABELS.address}
                            updateHandler={onUpdateField}
                            requredField={false}
                            value={profile.address ?? ''}
                        />
                    </div>
                </form>
                : <Loader />}
        </div>
    );
};

export default ContactsInfo;
