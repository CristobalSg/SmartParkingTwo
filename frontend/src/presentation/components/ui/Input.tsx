import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string;
}

const Input: React.FC<InputProps> = ({ label, value, ...props }) => {
  return (
    <div className="relative w-full">
      {/* Input */}
      <input
        {...props}
        value={value}
        required
        className="w-full px-4 pt-5 pb-2 text-white bg-white/10 border border-white/20 rounded-xl outline-none backdrop-blur-md focus:bg-white/20 focus:border-cyan-400 transition"
      />

      {/* Label flotante */}
      {label && (
        <label
          className={`absolute left-4 top-1 text-sm text-white/70 transition-all duration-300 pointer-events-none 
            ${value ? "-translate-y-3 scale-90 text-cyan-400 bg-purple-600 px-1 rounded" : "peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-cyan-400 peer-focus:bg-purple-600 peer-focus:px-1 peer-focus:rounded"}`}
        >
          {label}
        </label>
      )}

      {/* Borde animado */}
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300 transform -translate-x-1/2 pointer-events-none peer-focus:w-full"></span>
    </div>
  );
};

export default Input;
