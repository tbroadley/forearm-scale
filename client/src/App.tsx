import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoggedOutRoom from "./components/LoggedOutRoom";
import LoggedInRoom from "./components/LoggedInRoom";
import Homepage from "./components/Homepage";

const router = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/rooms/:roomId", element: <LoggedOutRoom /> },
  { path: "/rooms/:roomId/users/:userId", element: <LoggedInRoom /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
