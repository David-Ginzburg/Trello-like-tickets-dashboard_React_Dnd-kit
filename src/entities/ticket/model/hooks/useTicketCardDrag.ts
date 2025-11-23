import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "../types";

export const useTicketCardDrag = (ticket: Ticket, isDragDisabled: boolean = false) => {
	const isDraggable = !isDragDisabled;

	const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } =
		useSortable({
			id: ticket.id,
			disabled: !isDraggable,
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1,
	};

	const isOver = over !== null;

	return {
		isDraggable,
		attributes,
		listeners,
		setNodeRef,
		style,
		isDragging,
		isOver,
	};
};
