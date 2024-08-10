import { Routes, Route } from "react-router-dom";
import GlobalView from "../pages/global_view/GlobalView";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GlobalView />} />
    </Routes>
  );
}

export default AppRoutes;
