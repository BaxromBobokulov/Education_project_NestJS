import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, hasRole } from "../utils/auth";

export default function ProtectedRoute({ allowedRoles = [], children }) {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
