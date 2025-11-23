import { forwardRef } from "react";
import "./Button.css";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			className = "",
			variant = "primary",
			size = "md",
			isLoading = false,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				className={`button button--${variant} button--${size} ${className}`}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading ? (
					<>
						<span className="button__spinner" aria-hidden="true" />
						<span className="sr-only">Loading...</span>
					</>
				) : (
					children
				)}
			</button>
		);
	},
);

Button.displayName = "Button";

