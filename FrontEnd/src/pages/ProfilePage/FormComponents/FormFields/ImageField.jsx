import { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import preventEnterSubmit from '../../../../utils/preventEnterSubmit';
import PendingStatus from '../../../../components/MiniComponents/PendingModerationIcon/PendingStatus';
import MyModal from '../../UI/MyModal/MyModal';
import WarnImageDeleteModal from '../WarnImageDeleteModal';
import css from './ImageField.module.css';

const ImageField = ({
  name,
  label,
  accept,
  inputType = 'text',
  value,
  updateHandler,
  onDeleteImage,
  profile,
  error,
}) => {

  const [modal, setModal] = useState(false);

  const backgroundImage = {
    background: `url(${value}) lightgray 50% / cover no-repeat`,
  };

  const renderInput = () => (
    <input
      accept={accept}
      id={name}
      type={inputType}
      className={css['upload-file__input']}
      name={name}
      onChange={updateHandler}
      onKeyDown={preventEnterSubmit}
    />
  );

  const renderUpdateImageLabel = () => (
    <label className={css['update-file__label']} htmlFor={name}>
      <img
        className={css['upload-file__icon']}
        src={`${process.env.REACT_APP_PUBLIC_URL}/profilepage/camera_icon.png`}
        alt="Change icon"
      />
      <span className={css['update-file__text']}>змінити</span>
    </label>
  );

  const renderDeleteButton = () => (
    <div className={css['button__delete-container']}>
      <button
        type="button"
        className={css['upload-file__delete--wrapper']}
        onKeyDown={preventEnterSubmit}
        onClick={() => setModal(true)}
      >
        <img
          className={css['upload-file__icon']}
          src={`${process.env.REACT_APP_PUBLIC_URL}/profilepage/Vectordelete.png`}
          alt="Delete icon"
        />
        <span className={css['upload-file__delete--text']}>видалити</span>
      </button>
      <MyModal visible={modal}>
        <WarnImageDeleteModal
          onCancel={() => setModal(false)}
          onDelete={() => {
            onDeleteImage(name);
            setModal(false);
          }}/>
      </MyModal>
    </div>
  );

  return (
    <div
      className={classNames(css['fields__column'], {
        [css['fields__column--logo']]: name === 'logo',
      })}
    >
      <div className={css['fields__label']}>
        <label
          htmlFor={name}
          className={classNames(
            css['fields__label--text'],
            css['fields__field--notrequired']
          )}
        >
          {label}
        </label>
        {name === 'banner' && value && (
          <>
            {renderUpdateImageLabel()}
            {renderDeleteButton()}
          </>
        )}
      </div>
      <div
        className={classNames(css['upload-file__main'], {
        [css['upload-file__main--empty']]: !value,
      })}>
        {renderInput()}
        {!value && (
          <label className={css['upload-file__label']} htmlFor={name}>
            <span className={css['upload-file__text']}>Оберіть файл</span>
          </label>
        )}
        {name === 'banner' && value && (
          <>
            <div className={css['upload-file__wrapper--banner-page']}>
              <span className={css['upload-file__banner-image--title']}>
                Зображення для банера на сторінці профайлу
              </span>
              <div className={css['tooltip-container']}>
                <PendingStatus profile={profile} elementType="banner" />
                <div
                  className={css['upload-file__banner-image--page']}
                  style={backgroundImage}
                />
              </div>
            </div>
            <div className={css['upload-file__wrapper--banner-card']}>
              <span className={css['upload-file__banner-image--title']}>
                Зображення для карток
              </span>
              <div className={css['tooltip-container']}>
                <PendingStatus profile={profile} elementType="banner" />
                <div
                  className={css['upload-file__banner-image--card']}
                  style={backgroundImage}
                />
              </div>
            </div>
          </>
        )}
        {name === 'logo' && value && (
          <div className={css['tooltip-container']}>
            <PendingStatus profile={profile} elementType="logo" />
            <div className={css['upload-file__wrapper--logo']}>
              <div className={css['upload-file__logo']} style={backgroundImage} />
              {renderUpdateImageLabel()}
              {renderDeleteButton()}
            </div>
          </div>
        )}
      </div>
      {error && <div className={css['error-message']}>{error}</div>}
    </div>
  );
};

ImageField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  accept: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  value: PropTypes.string,
  updateHandler: PropTypes.func.isRequired,
  onDeleteImage: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  error: PropTypes.string,
};

export default ImageField;
