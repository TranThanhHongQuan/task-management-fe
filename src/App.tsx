import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./layouts/AppLayout";

import Projects from "./pages/project/Projects";
import ProjectTasks from "./pages/project/ProjectTasks";
import ProjectMembers from "./pages/ProjectMembers";
import MyTasks from "./pages/tasks/MyTasks";
import Notifications from "./pages/Notifications";

export default function App() {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/app/projects" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App (Protected) */}
      <Route path="/app" element={<AppLayout />}>
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId/tasks" element={<ProjectTasks />} />
        <Route path="projects/:projectId/members" element={<ProjectMembers />} />
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
