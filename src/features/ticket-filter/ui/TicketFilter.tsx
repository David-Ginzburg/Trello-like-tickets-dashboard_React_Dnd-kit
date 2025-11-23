import { useState } from "react";
import { Input } from "../../../shared/ui/Input/Input";
import "./TicketFilter.css";

export interface TicketFilterProps {
	onFilterChange: (filter: string) => void;
}

export const TicketFilter = ({ onFilterChange }: TicketFilterProps) => {
	const [filterValue, setFilterValue] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFilterValue(value);
		onFilterChange(value);
	};

	return (
		<div className="ticket-filter">
			<Input
				type="search"
				variant="search"
				placeholder="Search by customer name or ticket ID..."
				value={filterValue}
				onChange={handleChange}
				className="ticket-filter__input"
			/>
		</div>
	);
};

