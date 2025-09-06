// src/components/ui/InputField.jsx
import React from "react";

const InputField = ({ label, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
};

export default InputField;
