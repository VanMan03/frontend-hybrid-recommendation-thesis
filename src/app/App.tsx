import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AdminDataProvider } from "./context/AdminDataContext";

export default function App() {
  return (
    <AdminDataProvider>
      <RouterProvider router={router} />
    </AdminDataProvider>
  );
}
