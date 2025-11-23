export const useTicketCardClick = (
	onClick: (() => void) | undefined,
	isDragging: boolean,
) => {
	const handleClick = (e: React.MouseEvent) => {
		if (!isDragging && onClick) {
			e.stopPropagation();
			onClick();
		}
	};

	return handleClick;
};


