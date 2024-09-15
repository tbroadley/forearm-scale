import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Room from "./components/Room";
import Homepage from "./components/Homepage";

const router = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/rooms/:roomId", element: <Room /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
