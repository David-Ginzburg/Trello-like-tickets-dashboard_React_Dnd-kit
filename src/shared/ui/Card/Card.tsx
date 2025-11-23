import { forwardRef } from "react";
import "./Card.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "interactive";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
	({ children, className = "", variant = "default", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`card card--${variant} ${className}`}
				{...props}
			>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

