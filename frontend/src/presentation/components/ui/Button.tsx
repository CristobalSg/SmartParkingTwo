import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "special";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const base =
    "relative w-full rounded-lg font-medium transition overflow-hidden";

  const variants = {
    primary: "bg-primary text-white py-2 px-4 hover:bg-blue-700",
    secondary:
      "bg-gray-200 text-gray-800 py-2 px-4 hover:bg-gray-300",
    special:
      "py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-cyan-400 text-white " +
      (disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:translate-y-[-2px] hover:shadow-lg"),
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${props.className ?? ""}`}
    >
      {loading ? (
        <span className="relative flex items-center justify-center">
          <span className={`transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}>
            {children}
          </span>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </span>
          )}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
