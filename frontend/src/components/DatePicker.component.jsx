import React, { useState } from 'react';

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(input) {
  const parts = input.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

function DateInputComponent({ onDateChange, widthofInput }) {
  const [date, setDate] = useState(new Date());
  const [inputType, setInputType] = useState('text');
  const [inputValue, setInputValue] = useState(formatDate(new Date()));

  

  const onFocus = () => {
    setInputType('date');
    setInputValue(date.toISOString().split('T')[0]);
  };

  const onBlur = () => {
    setInputType('text');
    setInputValue(formatDate(date));
  };
  
  const onChange = (e) => {
    const newDate = inputType === 'date' ? new Date(e.target.value) : parseDate(e.target.value);
    setDate(newDate);
    const formattedDate = inputType === 'date' ? e.target.value : formatDate(newDate);
    setInputValue(formattedDate);
    onDateChange(formattedDate); // Call the callback with the new date
  };

  return (
    <input
      type={inputType}
      placeholder="DD/MM/YYYY"
      value={inputValue}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      style={widthofInput === undefined ? null : { width: widthofInput }}
    />
  );
}

export default DateInputComponent;
