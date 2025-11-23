import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is mobile (screen width < 768px)
 * @returns true if device is mobile, false otherwise
 */
export const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = useState<boolean>(() => {
		if (typeof window === "undefined") {
			return false;
		}
		return window.innerWidth < 768;
	});

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Check initial size
		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return isMobile;
};
