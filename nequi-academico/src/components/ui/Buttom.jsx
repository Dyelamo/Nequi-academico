// src/components/ui/Button.jsx
import React from "react";

const Button = ({ children, onClick, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
    >
      {children}
    </button>
  );
};

export default Button;
