import axios from 'axios';
import { PropTypes } from 'prop-types';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { Tooltip } from 'antd';
import useSWR from 'swr';
import  Cropper  from 'react-easy-crop';
import { useAuth, useProfile } from '../../../hooks';
import checkFormIsDirty from '../../../utils/checkFormIsDirty';
import defineChanges from '../../../utils/defineChanges';
import css from './FormComponents.module.css';

import { DirtyFormContext } from '../../../context/DirtyFormContext';
import CheckBoxField from './FormFields/CheckBoxField';
import HalfFormField from './FormFields/HalfFormField';
import ImageField from './FormFields/ImageField';
import MultipleSelectChip from './FormFields/MultipleSelectChip';
import TextField from './FormFields/TextField';
import Loader from '../../../components/Loader/Loader';
import validateEdrpou from '../../../utils/validateEdrpou';
import validateRnokpp from '../../../utils/validateRnokpp';
import getCroppedImage from '../../../utils/getCroppedImage';
import BanerModeration from './BanerModeration';
import ProfileFormButton from '../UI/ProfileFormButton/ProfileFormButton';

const LABELS = {
  name: 'Коротка назва компанії',
  official_name: 'Юридична назва компанії',
  edrpou: 'ЄДРПОУ',
  rnokpp: 'РНОКПП',
  regions: 'Регіон(и)',
  categories: 'Категорія(ї)',
  activities: 'Вид(и) діяльності',
  banner: 'Зображення для банера',
  logo: 'Логотип',
  common_info: 'Інформація про компанію',
  is_registered: 'Зареєстрована компанія',
  is_startup: 'Стартап проект, який шукає інвестиції',
};

const ERRORS = {
  name: {
    error: false,
    message: '',
  },
  official_name: {
    error: false,
    message: '',
  },
  categories: {
    error: false,
    message: '',
  },
  activities: {
    error: false,
    message: '',
  },
  common_info: {
    error: false,
    message: '',
  },
};

const TEXT_AREA_MAX_LENGTH = 1000;
const BANNER_IMAGE_SIZE = 5 * 1024 * 1024;
const LOGO_IMAGE_SIZE = 1 * 1024 * 1024;

const fetcher = (...args) => axios.get(...args).then((res) => res.data);

const GeneralInfo = (props) => {
  const { user } = useAuth();
  const { profile: mainProfile, mutate: profileMutate } = useProfile();
  const [profile, setProfile] = useState(props.profile);
  const [formStateErr, setFormStateErr] = useState(ERRORS);
  const [bannerImage, setBannerImage] = useState(props.profile?.banner?.path);
  const [logoImage, setLogoImage] = useState(props.profile?.logo?.cropped_path);
  const [bannerImageError, setBannerImageError] = useState(null);
  const [logoImageError, setLogoImageError] = useState(null);
  const [edrpouFieldError, setEdrpouFieldError] = useState(null);
  const [rnokppFieldError, setRnokppFieldError] = useState(null);
  const [companyTypeError, setCompanyTypeError] = useState(null);

  const [cropLogo, setCropLogo] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [logoFile, setlogoFile] = useState(null);

  const { data: fetchedRegions, isLoading: isRegionLoading } = useSWR(
    `${process.env.REACT_APP_BASE_API_URL}/api/regions/`,
    fetcher
  );
  const { data: fetchedActivities, isLoading: isActivitiesLoading } = useSWR(
    `${process.env.REACT_APP_BASE_API_URL}/api/activities/`,
    fetcher
  );
  const { data: fetchedCategories, isLoading: isCategoriesLoading } = useSWR(
    `${process.env.REACT_APP_BASE_API_URL}/api/categories/`,
    fetcher
  );

  const { setFormIsDirty } = useContext(DirtyFormContext);

  const fields = {
    name: { defaultValue: mainProfile?.name },
    official_name: { defaultValue: mainProfile?.official_name ?? null },
    edrpou: { defaultValue: mainProfile?.edrpou ?? null },
    rnokpp: { defaultValue: mainProfile?.rnokpp ?? null },
    regions: { defaultValue: mainProfile?.regions ?? [], type: 'array' },
    categories: { defaultValue: mainProfile?.categories ?? [], type: 'array' },
    activities: { defaultValue: mainProfile?.activities ?? [], type: 'array' },
    banner: { defaultValue: mainProfile?.banner ?? null, type: 'image' },
    logo: { defaultValue: mainProfile?.logo ?? null, type: 'image' },
    common_info: { defaultValue: mainProfile?.common_info ?? null },
    is_registered: { defaultValue: mainProfile?.is_registered ?? null },
    is_startup: { defaultValue: mainProfile?.is_startup ?? null },
  };

  useEffect(() => {
    const isDirty = checkFormIsDirty(fields, null, profile);
    setFormIsDirty(isDirty);
  }, [mainProfile, profile]);

  const checkRequiredFields = () => {
    let isValid = true;
    const newFormState = {};
    for (const key in profile) {
      if (key in ERRORS) {
        if (!profile[key] || (Array.isArray(profile[key]) && profile[key]?.length === 0)) {
          isValid = false;
          newFormState[key] = {
            error: true,
            message: 'Це поле є обов’язковим для заповнення.',
          };
        } else if (key === 'name' && profile[key].length < 2) {
          isValid = false;
          newFormState[key] = {
            error: true,
            message: 'Введіть від 2 до 45 символів.',
          };
        } else if (key === 'official_name' && profile[key].length < 2) {
          isValid = false;
          newFormState[key] = {
            error: true,
            message: 'Введіть від 2 до 200 символів.',
          };
        } else {
          newFormState[key] = {
            error: false,
            message: '',
          };
        }
      }
    }

    setFormStateErr({ ...formStateErr, ...newFormState });
    if (
      profile.official_name?.length !== 0 &&
      profile.official_name?.length < 2
    ) {
      isValid = false;
    }
    if (profile.name?.length < 2) {
      isValid = false;
    }
    if (profile.edrpou) {
      try {
        validateEdrpou(profile.edrpou);
      } catch (error) {
        isValid = false;
      }
    }
    if (profile.rnokpp) {
      try {
        validateRnokpp(profile.rnokpp);
      } catch (error) {
        isValid = false;
      }
    }
    if (!profile.is_registered && !profile.is_startup) {
      isValid = false;
    }
    if (bannerImageError || logoImageError) {
      isValid = false;
    }
    return isValid;
  };

  const onUpdateField = (e) => {
    const { value: fieldValue, name: fieldName } = e.target;
    const symbolCount = fieldValue.replace(/[\s]/g, '').length;
    const fieldValidationConfig = {
      name: {
        minLength: 2,
        maxLength: 45,
        errorMessage: 'Введіть від 2 до 45 символів.',
      },
      official_name: {
        minLength: 2,
        maxLength: 200,
        errorMessage: 'Введіть від 2 до 200 символів.',
      },
    };
    setFormStateErr((prev) => ({
      ...prev,
      [fieldName]: { error: false, message: '' },
    }));
    if (fieldValidationConfig[fieldName]) {
      const { minLength, errorMessage } = fieldValidationConfig[fieldName];
      if (symbolCount !== 0 && symbolCount < minLength) {
        setFormStateErr((prev) => ({
          ...prev,
          [fieldName]: {
            error: true,
            message: errorMessage,
          },
        }));
      }
    }
    setProfile((prevState) => {
      return { ...prevState, [fieldName]: fieldValue };
    });
  };

  const onBlurHandler = (e) => {
    const { value: rawFieldValue, name: fieldName } = e.target;
    const fieldValue = rawFieldValue.replace(/\s{2,}/g, ' ').trim();
    const requiredFields = ['official_name', 'name', 'common_info'];
    if (requiredFields.includes(fieldName) && !fieldValue) {
      setFormStateErr((prev) => ({
        ...prev,
        [fieldName]: {
          error: true,
          message: 'Це поле є обов’язковим для заповнення.',
        },
      }));
    }
    setProfile((prevState) => {
      return { ...prevState, [fieldName]: fieldValue };
    });
  };
  const onUpdateRegions = (e) => {
    let selectedRegions = [];
    for (let region of e) {
      let item = fetchedRegions.find((el) => el.name_ukr === region);
      if (item) {
        selectedRegions.push({
          id: item.id,
          name_eng: item.name_eng,
          name_ukr: region,
        });
      }
    }
    setProfile((prevState) => {
      return { ...prevState, ['regions']: selectedRegions };
    });
  };

  const onUpdateIdentifierField = (e) => {
    const identifierValue = e.target.value;
    const identifierName = e.target.name;
    setEdrpouFieldError(null);
    setRnokppFieldError(null);
    if (identifierValue && identifierName === 'edrpou') {
      try {
        validateEdrpou(identifierValue);
      } catch (error) {
        setEdrpouFieldError(error.message);
      }
    } else if (identifierValue && identifierName === 'rnokpp') {
      try {
        validateRnokpp(identifierValue);
      } catch (error) {
        setRnokppFieldError(error.message);
      }
    }
    setProfile((prevState) => {
      return { ...prevState, [identifierName]: identifierValue };
    });
  };

  const onChangeCheckbox = (e) => {
    const isAnyChecked =
      (profile.is_registered && e.target.name === 'is_startup') ||
      (profile.is_startup && e.target.name === 'is_registered') ||
      e.target.checked;
    if (!isAnyChecked) {
      setCompanyTypeError('Оберіть тип компанії, яку Ви представляєте');
    } else {
      setCompanyTypeError(null);
    }
    setProfile((prevState) => {
      return { ...prevState, [e.target.name]: e.target.checked };
    });
  };

  const onUpdateTextAreaField = (e) => {
    const { name, value } = e.target;
    if (value?.length <= TEXT_AREA_MAX_LENGTH) {
      setProfile((prevState) => {
        return { ...prevState, [name]: value };
      });
      if (name === 'common_info' && value.trim() !== '') {
        setFormStateErr((prev) => ({
          ...prev,
          common_info: {
            error: false,
            message: '',
          },
        }));
      }
    }
  };

  const onUpdateActivities = (e) => {
    let selectedActivities = [];
    for (let activity of e) {
      let item = fetchedActivities.find((el) => el.name === activity);
      if (item) {
        selectedActivities.push({ id: item.id, name: activity });
      }
    }
    setProfile((prevState) => {
      return { ...prevState, ['activities']: selectedActivities };
    });
  };

  const onUpdateCategories = (e) => {
    let selectedCategories = [];
    for (let category of e) {
      let item = fetchedCategories.find((el) => el.name === category);
      if (item) {
        selectedCategories.push({ id: item.id, name: category });
      }
    }
    setProfile((prevState) => {
      return { ...prevState, ['categories']: selectedCategories };
    });
  };

  const uploadImage = async (url, imageKey, image) => {
    if (image instanceof File || image === '') {
      const formData = new FormData();
      formData.append('image_path', image);
      try {
        const response = await axios.post(url, formData);
        setProfile((prevState) => {
          return { ...prevState, [imageKey]: {
            ...prevState[imageKey],
            uuid: response.data.uuid
          }};
        });
      } catch (error) {
        console.error(
          'Error uploading image:',
          error.response ? error.response.data : error.message
        );
        if (!error.response || error.response.status !== 401) {
          toast.error('Не вдалося завантажити банер/лого, сталася помилка');
        }
      }
    }
  };

  const checkMaxImageSize = (name, image) => {
    const maxSize =
      name === 'banner' ? BANNER_IMAGE_SIZE : LOGO_IMAGE_SIZE;
    if (image.size > maxSize) {
      name === 'banner' &&
        setBannerImageError('Максимальний розмір файлу 5 Mb');
      name === 'logo' &&
        setLogoImageError('Максимальний розмір файлу 1 Mb');
    } else {
      name === 'banner' && setBannerImageError(null);
      name === 'logo' && setLogoImageError(null);
      return true;
    }
  };

  const onUpdateBanner = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    const imageUrl = `${process.env.REACT_APP_BASE_API_URL}/api/image/banner/`;
    if (file && checkMaxImageSize(e.target.name, file)) {
      setBannerImage(URL.createObjectURL(file));
      await uploadImage(imageUrl, e.target.name, file);
    }
  };

  const onUpdateLogo = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file && checkMaxImageSize(e.target.name, file)) {
      setLogoImage(URL.createObjectURL(file));
      setCropLogo(true);
      setlogoFile(file);
    }
  };

  const onLogoCancel = () => {
    setCropLogo(false);
    setLogoImage(props.profile?.logo?.cropped_path);
  };

  const onLogoSubmit = async (e) => {
    e.preventDefault();

    const croppedBlob  = await getCroppedImage(logoImage, croppedAreaPixels);
    const croppedLogoFile = new File([croppedBlob], logoFile.name, {type: logoFile.type});

    setLogoImage(URL.createObjectURL(croppedBlob));

    const formData = new FormData();
    formData.append('image_path', logoFile);
    formData.append('cropped_image_path', croppedLogoFile);

    const url = `${process.env.REACT_APP_BASE_API_URL}/api/image/logo/`;
    try {
      const response = await axios.post(url, formData);
      setProfile((prevState) => {
        return { ...prevState, ['logo']: {
          ...prevState['logo'],
          uuid: response.data.uuid
        }};
      });
      toast.success('Зображення успішно завантажене');
      setCropLogo(false);
    } catch (error) {
      console.error(
        'Error uploading image:',
        error.response ? error.response.data : error.message
      );
      if (!error.response || error.response.status !== 401) {
        toast.error('Не вдалося завантажити банер/лого, сталася помилка');
      }
    }
  };

  const onLogoCropComplete = ( _, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const deleteImageHandler = async (name) => {
    const imageUrl =
      name === 'banner'
      ? `${process.env.REACT_APP_BASE_API_URL}/api/image/banner/${profile.banner?.uuid}`
      : `${process.env.REACT_APP_BASE_API_URL}/api/image/logo/${profile.logo?.uuid}`;
    try {
      await axios.delete(imageUrl);
      if (name === 'banner') setBannerImage(null);
      if (name === 'logo') setLogoImage(null);

      setProfile((prevState) => {
        const newState = { ...prevState, [name]: null };
        return newState;
    });
  } catch (error) {
    console.error('Error deleting image:',
      error.response ? error.response.data : error.message);
    toast.error('Не вдалося видалити банер/лого, сталася помилка');
  }
  };

  const errorMessages = {
    'profile with this edrpou already exists.':
      'Компанія з таким ЄДРПОУ вже існує',
    'profile with this rnokpp already exists.':
      'Фізична особа-підприємець з таким РНОКПП вже існує',
  };

  function handleError(error) {
    if (error.response && error.response.status === 400) {
      const errorData = error.response.data;
      Object.keys(errorData).forEach((key) => {
        const message = errorData[key][0];
        if (errorMessages[message]) {
          toast.error(errorMessages[message]);
        }
      });
    } else if (!error.response || error.response.status !== 401) {
      toast.error('Не вдалося зберегти зміни, сталася помилка');
    }
    console.error(
      'Помилка:',
      error.response ? error.response.data : error.message
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!checkRequiredFields()) {
      toast.error(
        'Зміни не можуть бути збережені, перевірте правильність заповнення полів'
      );
    } else {
      const data = defineChanges(fields, profile, null);
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_BASE_API_URL}/api/profiles/${user.profile_id}`,
        data.profileChanges
        );
        profileMutate(response.data);
        toast.success('Зміни успішно збережено');
        setFormIsDirty(false);
      } catch (error) {
        handleError(error);
      }
    }
  };
  return (
    <div className={css['form__container']}>
      <h3 className={css['form__head']}>Загальна інформація</h3>
      <div className={css['divider']}></div>
      {user && profile && mainProfile ? (
        <form
          id="GeneralInfo"
          onSubmit={handleSubmit}
          autoComplete="off"
          noValidate
        >
          <div className={css['fields']}>
          <div className={css['fields-groups']}>
            <div className={css['field-with-tooltip']}>
            <HalfFormField
                name="name"
                fieldPlaceholder="Введіть назву компанії"
                label={
                  <span className={css['field-label']}>
                    {LABELS.name}
                    <Tooltip title="Назва буде використовуватися на картці компанії">
                      <span className={css['tooltip-icon']}>?</span>
                    </Tooltip>
                  </span>
                }
                updateHandler={onUpdateField}
                onBlur={onBlurHandler}
                error={
                  formStateErr['name']?.['error']
                    ? formStateErr['name']['message']
                    : null
                }
                requiredField={true}
                value={profile.name}
                maxLength={45}
              />
            </div>
              <HalfFormField
                name="official_name"
                fieldPlaceholder="Введіть юридичну назву компанії"
                label={LABELS.official_name}
                updateHandler={onUpdateField}
                onBlur={onBlurHandler}
                value={profile.official_name ?? ''}
                error={
                  formStateErr['official_name']?.['error']
                    ? formStateErr['official_name']['message']
                    : null
                }
                requiredField={true}
                maxLength={200}
              />
            </div>
            <div className={css['fields-groups']}>
              {mainProfile?.is_fop ? (
                <HalfFormField
                  inputType="text"
                  name="rnokpp"
                  fieldPlaceholder="Введіть РНОКПП"
                  label={LABELS.rnokpp}
                  updateHandler={onUpdateIdentifierField}
                  value={profile.rnokpp ?? ''}
                  error={rnokppFieldError}
                  maxLength={10}
                />
              ) : (
                <HalfFormField
                  inputType="text"
                  name="edrpou"
                  fieldPlaceholder="Введіть ЄДРПОУ"
                  label={LABELS.edrpou}
                  updateHandler={onUpdateIdentifierField}
                  value={profile.edrpou ?? ''}
                  error={edrpouFieldError}
                  maxLength={8}
                />
              )}
              {isRegionLoading ? (
                <Loader />
              ) : (
                <MultipleSelectChip
                  name="regions"
                  options={fetchedRegions}
                  label={LABELS.regions}
                  updateHandler={onUpdateRegions}
                  value={profile.regions.map((obj) => obj.name_ukr) ?? ''}
                />
              )}
            </div>
            <div className={css['fields-groups']}>
              {isActivitiesLoading ? (
                <Loader />
              ) : (
                <MultipleSelectChip
                  name="activities"
                  options={fetchedActivities}
                  label={LABELS.activities}
                  updateHandler={onUpdateActivities}
                  requiredField={true}
                  value={profile.activities.map((obj) => obj.name) ?? ''}
                  error={
                    formStateErr['activities']['error']
                      ? formStateErr['activities']['message']
                      : null
                  }
                />
              )}
              {isCategoriesLoading ? (
                <Loader />
              ) : (
                <MultipleSelectChip
                  name="categories"
                  options={fetchedCategories}
                  label={LABELS.categories}
                  updateHandler={onUpdateCategories}
                  requiredField={true}
                  value={profile.categories.map((obj) => obj.name) ?? ''}
                  error={
                    formStateErr['categories']['error']
                      ? formStateErr['categories']['message']
                      : null
                  }
                />
              )}
            </div>
            <ImageField
              accept="image/png, image/jpeg"
              inputType="file"
              name="banner"
              label={LABELS.banner}
              updateHandler={onUpdateBanner}
              value={bannerImage}
              error={bannerImageError}
              onDeleteImage={deleteImageHandler}
              profile={mainProfile}
            />
            <ImageField
              accept="image/png, image/jpeg"
              inputType="file"
              name="logo"
              label={LABELS.logo}
              updateHandler={onUpdateLogo}
              value={logoImage}
              error={logoImageError}
              onDeleteImage={deleteImageHandler}
              profile={mainProfile}
            />
            {cropLogo &&
            <>
              <Tooltip title={'Оберіть область логотипу, яка буде відображатись на картці компанії.\nНа сторінці компанії буде відображатись оригінальне зображення.'}
                      open={true}
              >
                <div className={css['crop-container']}>
                    <Cropper
                      image={logoImage}
                      crop={crop}
                      zoom={zoom}
                      onCropChange={setCrop}
                      onCropComplete={onLogoCropComplete}
                      onZoomChange={setZoom}
                      cropShape="round"
                      aspect={1}
                      />
                </div>
                <div className={css['submit-button__container']}>
                  <button className={css['submit-button']} onClick={onLogoSubmit}>Зберегти</button>
                  <button className={css['submit-button']} onClick={onLogoCancel}>Скасувати</button>
                </div>
              </Tooltip>
            </>
            }
            <BanerModeration />
            <TextField
              name="common_info"
              label={LABELS.common_info}
              updateHandler={onUpdateTextAreaField}
              onBlur={onBlurHandler}
              value={profile.common_info ?? ''}
              maxLength={TEXT_AREA_MAX_LENGTH}
              requiredField={true}
              error={
                formStateErr['common_info']?.['error']
                  ? formStateErr['common_info']['message']
                  : null
              }
            />
            <CheckBoxField
              name="companyType"
              nameRegister="is_registered"
              valueRegister={profile.is_registered}
              nameStartup="is_startup"
              valueStartup={profile.is_startup}
              updateHandler={onChangeCheckbox}
              error={companyTypeError}
              requiredField={true}
            />
          </div>
          <div className={css['bottom-divider']}></div>
          <ProfileFormButton />
        </form>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default GeneralInfo;

GeneralInfo.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    official_name: PropTypes.string,
    is_fop: PropTypes.bool,
    rnokpp: PropTypes.string,
    edrpou: PropTypes.string,
    region: PropTypes.string,
    common_info: PropTypes.string,
    is_registered: PropTypes.bool,
    is_startup: PropTypes.bool,
    categories: PropTypes.array,
    activities: PropTypes.array,
    banner: PropTypes.shape({
      uuid: PropTypes.string,
      path: PropTypes.string,
    }),
    logo: PropTypes.shape({
      uuid: PropTypes.string,
      path: PropTypes.string,
    }),
  }).isRequired,
};
