import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardPage } from "./app/pages/DashboardPage";

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

export const router = createBrowserRouter(routes, { basename: "/" });
