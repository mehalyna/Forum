import css from './FormComponents.module.css';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { DirtyFormContext } from  '../../../context/DirtyFormContext';
import { useUser, useProfile } from '../../../hooks/';
import FullField from './FormFields/FullField';
import HalfFormField from './FormFields/HalfFormField';
import Loader from '../../loader/Loader';

const LABELS = {
    'phone': 'Телефон',
    'address': 'Адрес(и)',
};

const ContactsInfo = (props) => {
    const { user } = useUser();
    const { profile: mainProfile, mutate: profileMutate } = useProfile();
    const [profile, setProfile] = useState(props.profile);
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const { setFormIsDirty } = useContext(DirtyFormContext);

    // TODO: update default values as new fields added

    const defaultValues = {
        'phone': mainProfile?.phone ?? null,
        'address': mainProfile?.address ?? null,
    };

    const checkFormIsDirty = () => {
        let isDirty = false;
        Object.keys(defaultValues).forEach((key) => {
            if (defaultValues[key] !== profile[key]) {
                isDirty = true;
                return;
          }
        });
        setFormIsDirty(isDirty);
      };

    useEffect(() => {
        checkFormIsDirty();
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
        if (validateForm()) {
            const token = localStorage.getItem('Token');
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/profiles/${user.profile_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: profile.phone,
                        address: profile.address,
                    }),
                });

                if (response.status === 200) {
                    const updatedProfileData = await response.json();
                    profileMutate(updatedProfileData);
                    setFormIsDirty(false);
                    toast.success('Зміни успішно збережено');
                } else {
                    console.error('Помилка');
                }
            } catch (error) {
                console.error('Помилка:', error);
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
