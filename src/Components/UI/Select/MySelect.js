import React from "react";

const MySelect = ({ options, defaultValue, onChange,value }) => {
  return (  
    <select value={value} onChange={(e) => onChange(e.target.value)} className="form-select w-50">
      <option disabled value="">
        {defaultValue}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.name}
        </option>
      ))}
    </select>
  );
};

export default MySelect;
