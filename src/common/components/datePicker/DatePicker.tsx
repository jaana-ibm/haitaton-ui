import React from 'react';
import { Controller, Control } from 'react-hook-form';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.styles.scss';

type PropTypes = {
  name: string;
  id: string;
  control: Control;
  rules?: { required: boolean };
  label?: string;
  invalid?: boolean;
  errorMsg?: string;
  disabled?: boolean;
  selected?: Date;
  locale?: string;
  dateFormat?: string;
  value?: Date;
  defaultValue?: Date | null;
};
const DatePickerComp: React.FC<PropTypes> = (props) => {
  const {
    name,
    id,
    control,
    rules,
    label,
    invalid,
    errorMsg,
    disabled,
    locale,
    dateFormat,
    defaultValue,
  } = props;
  return (
    <>
      <Controller
        name={name}
        id={id}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ onChange, onBlur, value }) => (
          <div className="datePicker">
            <label htmlFor={id}>{label}</label>
            <DatePicker
              id={id}
              name={name}
              onChange={onChange}
              selected={value}
              disabled={disabled}
              locale={locale}
              dateFormat={dateFormat}
              value={value}
              className={invalid ? 'invalid' : ''}
            />
            {invalid && <span className="error-text">{errorMsg}</span>}
          </div>
        )}
      />
    </>
  );
};
export default DatePickerComp;