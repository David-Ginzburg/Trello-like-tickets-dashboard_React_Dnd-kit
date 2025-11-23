import "../shared/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./router";

function App() {
	return (
		<>
			<ReactRouterProvider router={router} />
			<ToastContainer
				position="top-right"
				autoClose={2000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
				toastClassName="toast-mobile"
			/>
		</>
	);
}

export default App;

