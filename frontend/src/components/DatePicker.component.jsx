import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

const DateInputComponent = ({ onDateChange, widthofInput, value }) => {
  const [dateValue, setDateValue] = useState(value || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!value) {
      setDateValue(new Date().toISOString().split("T")[0]);
    }
  }, [value]);

  const handleChange = (e) => {
    setDateValue(e.target.value);
    onDateChange(e.target.value);
  };

  return (
    <Form.Control
      type="date"
      value={dateValue}
      onChange={handleChange}
      style={{ width: widthofInput }}
    />
  );
};

export default DateInputComponent;
