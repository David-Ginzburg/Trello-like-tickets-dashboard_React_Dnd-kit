export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + "...";
};

export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
	return new Date(dateString).toLocaleString();
};


