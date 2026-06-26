import { Box, Button, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../utils/auth";

export default function Unauthorized() {
    const navigate = useNavigate();
    const role = getUserRole();

    const handleGoBack = () => {
        navigate("/dashboard", { replace: true });
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f1f5f9",
                px: 2,
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    maxWidth: 420,
                    bgcolor: "white",
                    borderRadius: 3,
                    p: 5,
                    border: "1px solid #e2e8f0",
                }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        bgcolor: "#fef2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 36, color: "#ef4444" }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                    Ruxsat yo'q
                </Typography>

                <Typography sx={{ fontSize: 14, color: "#64748b", mb: 3 }}>
                    Sizning rolingiz ({role || "noma'lum"}) bu sahifaga kirish uchun yetarli emas.
                </Typography>

                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        onClick={handleGoBack}
                        sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, textTransform: "none" }}
                    >
                        Dashboardga qaytish
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{ textTransform: "none", borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                        Chiqish
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
