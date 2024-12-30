import PropTypes from 'prop-types';
import preventEnterSubmit from '../../../../utils/preventEnterSubmit';
import css from './HalfFormField.module.css';
import { Tooltip } from 'antd';
import { forwardRef } from 'react';

const LENGTH_EMAIL = 19;

const HalfFormField = forwardRef(function HalfFormField(props, ref) {
  const shouldShowTooltip =
    props.name === 'email' && props.value.length > LENGTH_EMAIL;

  const fieldValue = shouldShowTooltip
    ? `${props.value.slice(0, LENGTH_EMAIL)}...`
    : props.value;

  return (
    <div className={css['fields__column']}>
      <div className={css['fields__label']}>
        {props.requiredField && (
          <span className={css['fields__label--required']}>*</span>
        )}
        <label
          htmlFor={props.label ? props.label : props.name}
          className={`${css['fields__label--text']} ${
            !props.requiredField && css['fields__field--notrequired']
          }`}
        >
          {props.label}
        </label>
      </div>
      <div className={css['fields__field']}>
        <Tooltip
          title={shouldShowTooltip ? props.value : ''}
          placement="bottom"
        >
          <input
            type={props.inputType || 'text'}
            className={`${css['fields__field--input']} ${
              props.name === 'email' && css['disabled__field']
            }`}
            name={props.name}
            id={props.label ? props.label : props.name}
            value={fieldValue}
            placeholder={props.fieldPlaceholder || 'Введіть текст'}
            onBlur={props.onBlur}
            onKeyDown={preventEnterSubmit}
            onChange={props.updateHandler}
            ref={ref}
            required={props.requiredField ? 'required' : ''}
            disabled={props.name === 'email' ? 'disabled' : ''}
            maxLength={props.maxLength}
            autoComplete="off"
          />
        </Tooltip>
      </div>
      {(props.requiredField || props.error) && (
        <div className={css['error-message']}>
          {Array.isArray(props.error) ? (
            props.error.map((error, index) => <span key={index}>{error}</span>)
          ) : (
            <span>{props.error}</span>
          )}
        </div>
      )}
    </div>
  );
});

HalfFormField.propTypes = {
  requiredField: PropTypes.bool,
  inputType: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  fieldPlaceholder: PropTypes.string,
  maxLength: PropTypes.number,
  updateHandler: PropTypes.func,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default HalfFormField;
