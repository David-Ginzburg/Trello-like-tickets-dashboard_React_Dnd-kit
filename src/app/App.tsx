import "../shared/styles/globals.css";

import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
	return <ReactRouterProvider router={router} />;
}

export default App;

