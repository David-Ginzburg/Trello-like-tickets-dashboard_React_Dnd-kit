import { forwardRef } from "react";
import "./Input.css";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "search";
	error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className = "", variant = "default", error = false, ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={`input input--${variant} ${error ? "input--error" : ""} ${className}`}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

