import { useState } from "react";

export const useTicketFilterInput = (
	onFilterChange: (filter: string) => void,
) => {
	const [filterValue, setFilterValue] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFilterValue(value);
		onFilterChange(value);
	};

	return {
		filterValue,
		handleChange,
	};
};


