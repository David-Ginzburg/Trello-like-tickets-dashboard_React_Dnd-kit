import { useState } from "react";

export const useTicketSearch = () => {
	const [filter, setFilter] = useState("");

	return {
		filter,
		setFilter,
	};
};

