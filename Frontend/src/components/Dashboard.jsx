import { getUserRole } from "../utils/auth";
import { ROLES } from "../constants/roles";
import AdminDashboard from "./dashboards/AdminDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import { Box, Typography } from "@mui/material";

const ROLE_DASHBOARD_MAP = {
    [ROLES.SUPERADMIN]: AdminDashboard,
    [ROLES.ADMIN]: AdminDashboard,
    [ROLES.TEACHER]: TeacherDashboard,
    [ROLES.STUDENT]: StudentDashboard,
    [ROLES.ASSISTANT]: TeacherDashboard,
};

export default function Dashboard() {
    const role = getUserRole();
    const DashboardComponent = ROLE_DASHBOARD_MAP[role];

    if (!DashboardComponent) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f1f5f9" }}>
                <Typography sx={{ color: "#64748b", fontSize: 15 }}>
                    Noma'lum rol: {role || "aniqlanmadi"}. Administrator bilan bog'laning.
                </Typography>
            </Box>
        );
    }

    return <DashboardComponent />;
}
