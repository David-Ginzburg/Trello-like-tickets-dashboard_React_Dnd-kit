import "./App.css";

import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { router } from "./routes";

function App() {
	return <ReactRouterProvider router={router} />;
}

export default App;
