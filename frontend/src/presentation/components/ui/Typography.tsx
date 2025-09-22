import React from "react";
import clsx from "clsx";

type TypographyProps = {
  variant?: "h1" | "h2" | "h3" | "p" | "span";
  children: React.ReactNode;
  className?: string;
};

const baseStyles: Record<string, string> = {
  h1: "text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200",
  h2: "text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200",
  h3: "text-2xl font-bold text-white",
  p: "text-white/80 text-base font-normal",
  span: "text-white/80 text-sm",
};

const Typography: React.FC<TypographyProps> = ({
  variant = "p",
  children,
  className,
}) => {
  const Component = variant as keyof JSX.IntrinsicElements;

  return (
    <Component className={clsx(baseStyles[variant], className)}>
      {children}
    </Component>
  );
};

export default Typography;
