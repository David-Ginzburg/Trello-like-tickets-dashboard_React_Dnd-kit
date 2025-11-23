import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";

export const getRedirect = (path: string, route: string) => {
	const element = <Navigate to={route} replace />;

	return {
		path,
		element,
	};
};

export const dashboard = {
	path: "/",
	element: <DashboardPage />,
};

export const routes = [
	{
		element: (
			<div>
				<Outlet />
			</div>
		),
		children: [dashboard, getRedirect("/dashboard", "/")],
	},
];

// Get base path from import.meta.env.BASE_URL (set by Vite)
const basename = import.meta.env.BASE_URL || "/";

export const router = createBrowserRouter(routes, { basename });
