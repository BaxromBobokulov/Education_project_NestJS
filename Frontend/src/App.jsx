import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import ForgotPass from "./pages/ForgotPass";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import { NotificationProvider } from "./components/NotificationContext";
import { ADMIN_ROLES, ALL_AUTHENTICATED_ROLES, ROLES } from "./constants/roles";

function App() {
    return (
        <NotificationProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPass />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={ALL_AUTHENTICATED_ROLES}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teacher/*"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ASSISTANT]}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/*"
                        element={
                            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
}

export default App;
