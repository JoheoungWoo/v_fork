import { RouterProvider } from "react-router-dom";
// import root from "./router/root";
import root from "@/router/root";

function App() {
  return <RouterProvider router={root} />;
}

export default App;
