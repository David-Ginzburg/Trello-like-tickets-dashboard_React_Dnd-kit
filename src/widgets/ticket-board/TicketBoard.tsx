import { DndContext, DragOverlay } from "@dnd-kit/core";
import { TicketColumn } from "./TicketColumn";
import { TicketFilter } from "../../features/ticket-filter/ui/TicketFilter";
import { TicketDetailsModal } from "../../features/ticket-details/ui/TicketDetailsModal";
import { TicketCard } from "../../entities/ticket/ui/TicketCard";
import { Button } from "../../shared/ui/Button/Button";
import { useTickets } from "./model/hooks/useTickets";
import { useTicketFilter } from "./model/hooks/useTicketFilter";
import { useTicketGrouping } from "./model/hooks/useTicketGrouping";
import { useTicketModal } from "./model/hooks/useTicketModal";
import { useDragAndDrop } from "./model/hooks/useDragAndDrop";
import { useIsMobile } from "../../shared/lib/useIsMobile";
import type { Ticket } from "../../entities/ticket/model/types";
import { TICKET_STATUS_ORDER } from "../../entities/ticket/model/const/constants";
import "./TicketBoard.css";

export const TicketBoard = () => {
	const { tickets, updateTicket, refreshTickets, isLoading, reorderTickets } = useTickets();
	const {
		filter,
		setFilter,
		selectedTicket,
		isModalOpen,
		openModal,
		closeModal,
		updateSelectedTicket,
	} = useTicketModal();

	const isMobile = useIsMobile();
	const filteredTickets = useTicketFilter(tickets, filter);
	const ticketsByStatus = useTicketGrouping(filteredTickets);

	const {
		sensors,
		activeTicket,
		activeId,
		collisionDetectionStrategy,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop({
		tickets: filteredTickets,
		selectedTicket,
		onTicketUpdate: updateTicket,
		onSelectedTicketUpdate: updateSelectedTicket,
		onTicketsReorder: reorderTickets,
		filter,
		isMobile,
	});

	const handleStatusChange = (updatedTicket: Ticket) => {
		updateTicket(updatedTicket);
		updateSelectedTicket(updatedTicket);
	};

	if (isLoading) {
		return (
			<div className="ticket-board ticket-board--loading">
				<div className="ticket-board__spinner">Loading tickets...</div>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetectionStrategy}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="ticket-board">
				<div className="ticket-board__header">
					<h1 className="ticket-board__title">Customer Support AI Agent Dashboard</h1>
					<div className="ticket-board__controls">
						<TicketFilter onFilterChange={setFilter} />
						<Button
							onClick={refreshTickets}
							variant="secondary"
							size="md"
							disabled={isLoading}
							title="Refresh mock data"
						>
							🔄 Refresh Data
						</Button>
					</div>
				</div>

				<div className="ticket-board__columns">
					{TICKET_STATUS_ORDER.map((status) => (
						<TicketColumn
							key={status}
							status={status}
							tickets={ticketsByStatus[status] || []}
							onTicketClick={openModal}
							activeId={activeId}
							activeTicket={activeTicket}
							isDragDisabled={filter.trim().length > 0 || isMobile}
						/>
					))}
				</div>

				<DragOverlay>
					{activeTicket ? (
						<div style={{ opacity: 0.8 }}>
							<TicketCard ticket={activeTicket} />
						</div>
					) : null}
				</DragOverlay>

				<TicketDetailsModal
					ticket={selectedTicket}
					isOpen={isModalOpen}
					onClose={closeModal}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</DndContext>
	);
};
