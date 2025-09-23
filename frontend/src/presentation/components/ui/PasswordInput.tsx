import React, { useState } from "react";
import Input from "../ui/Input";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder = "Contraseña" }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full mb-6">
      {/* Input */}
      <Input
            label={placeholder}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder="admin123"
            required
          />

      {/* Toggle botón */}
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition"
        aria-label="Toggle password visibility"
      >
        {showPassword ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.74 7.47 7.52 4.5 12 4.5c4.48 0 8.26 2.97 9.75 7.5-1.49 4.53-5.27 7.5-9.75 7.5-4.48 0-8.26-2.97-9.75-7.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.34 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395m2.159-1.218A10.45 10.45 0 0022.066 12c-1.292-4.338-5.31-7.5-10.066-7.5-1.605 0-3.126.38-4.463 1.057M6.228 6.228L3 3m3.228 3.228l12.544 12.544" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
