import { Input } from "../../../shared/ui/Input/Input";
import { useTicketFilterInput } from "../model/hooks/useTicketFilterInput";
import "./TicketFilter.css";

export interface TicketFilterProps {
	onFilterChange: (filter: string) => void;
}

export const TicketFilter = ({ onFilterChange }: TicketFilterProps) => {
	const { filterValue, handleChange } = useTicketFilterInput(onFilterChange);

	return (
		<div className="ticket-filter" data-testid="ticket-filter">
			<Input
				type="search"
				variant="search"
				placeholder="Search by customer name or ticket ID..."
				value={filterValue}
				onChange={handleChange}
				className="ticket-filter__input"
				data-testid="ticket-search-input"
			/>
		</div>
	);
};
