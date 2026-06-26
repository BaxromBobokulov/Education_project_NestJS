import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Select,
    MenuItem,
    IconButton,
    Paper,
    CircularProgress
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Ko'zcha ikonkiasi
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { getCurrentUser } from "../../utils/auth";
import axios from "axios";

const BASE = "http://localhost:3000";

export default function Profil() {
    const [statusFilter, setStatusFilter] = useState("Aktiv");
    const [showSalary, setShowSalary] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const user = getCurrentUser();
            if (!user || !user.id) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE}/teachers/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error("Profilni yuklashda xatolik:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    const branchesList = profile?.teacherGroups 
        ? [...new Set(profile.teacherGroups.map(tg => tg.groups?.rooms?.name).filter(Boolean))]
        : [];
    const branchesStr = branchesList.length > 0 ? branchesList.join(", ") : "Chilonzor";

    return (
        <Box sx={{ width: "100%", fontFamily: "sans-serif" }}>
            
            {/* FOYDALANUVCHI ISMI-SHARIFI */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 3, letterSpacing: "-0.5px" }}>
                {profile ? `${profile.first_name} ${profile.last_name}` : "Baxrom Boboqulov"}
            </Typography>

            {/* ASOSIY GRID MAKETI */}
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: { xs: "wrap", md: "nowrap" } }}>
                
                {/* CHAP TOMON: SHAXSIY MA'LUMOTLAR (ACCORDIONS) */}
                <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    
                    {/* 1. Umumiy ma'lumotlar */}
                    <Accordion defaultExpanded sx={{ boxShadow: "none", border: "1px solid #e2e8f0", borderRadius: "12px !important", "&::before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Umumiy ma'lumot</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, px: 3, pb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            
                            {/* Profil rasmi */}
                            <Avatar 
                                src={profile?.photo ? `${BASE}/user/image/${profile.photo}` : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                                sx={{ width: 110, height: 110, mb: 3 }} 
                            />

                            {/* Detallar */}
                            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Ish holati</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                        {profile?.status === "active" ? "Ishlayapti" : "Ishlamayapti"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Rol</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                        {profile?.role || "Assistant"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8", mt: 0.3 }}>Filiallar</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textAlign: "right", maxWidth: 160, lineHeight: 1.4 }}>
                                        {branchesStr}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Telefon raqami</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                        {profile?.phone || "+998 94 406 50 22"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Jinsi</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                        {profile?.gender || "Erkak"}
                                    </Typography>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* 2. Qo'shimcha kontaktlar */}
                    <Accordion sx={{ boxShadow: "none", border: "1px solid #e2e8f0", borderRadius: "12px !important", "&::before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Qo'shimcha kontaktlar</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography sx={{ fontSize: 13, color: "#64748b" }}>Mavjud emas</Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* 3. Akademik haqida ma'lumot */}
                    <Accordion sx={{ boxShadow: "none", border: "1px solid #e2e8f0", borderRadius: "12px !important", "&::before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Akademik haqida ma'lumot</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography sx={{ fontSize: 13, color: "#64748b" }}>Mavjud emas</Typography>
                        </AccordionDetails>
                    </Accordion>

                </Box>

                {/* O'NG TOMON: AKADEMIK TO'LOV VA GURUHLAR RO'YXATI */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
                    
                    {/* TEPPA QISM: AKADEMIK TO'LOV PANEL */}
                    <Paper sx={{ 
                        p: 2, 
                        px: 3,
                        borderRadius: "12px", 
                        border: "1px solid #e2e8f0", 
                        boxShadow: "none", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        bgcolor: "#ffffff"
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                                Akademikga to'lov:
                            </Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b", letterSpacing: "1px" }}>
                                {showSalary ? (profile?.salary || "4,500,000 UZS") : "******"}
                            </Typography>
                            <IconButton size="small" onClick={() => setShowSalary(!showSalary)} sx={{ color: "#2563eb", ml: 0.5 }}>
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                        
                        <Button 
                            variant="outlined" 
                            startIcon={<MenuIcon sx={{ fontSize: 16 }} />}
                            sx={{ 
                                textTransform: "none", 
                                color: "#64748b", 
                                borderColor: "#cbd5e1",
                                borderRadius: "8px",
                                fontSize: 13,
                                "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" }
                            }}
                        >
                            Menu
                        </Button>
                    </Paper>

                    {/* APTEKA USLUBIDA GURUHLAR BO'LIMI */}
                    <Box>
                        {/* Tab Sarlavha */}
                        <Box sx={{ borderBottom: "2px solid #e2e8f0", display: "inline-block", width: "100%", mb: 2 }}>
                            <Typography sx={{ 
                                fontSize: 14, 
                                fontWeight: 600, 
                                color: "#059669", 
                                pb: 1, 
                                borderBottom: "2px solid #059669", 
                                display: "inline-block",
                                mb: "-2px"
                            }}>
                                Guruhlar
                            </Typography>
                        </Box>

                        {/* Filial va Status Filter Paneli */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{branchesStr}</Typography>
                                <Typography sx={{ fontSize: 12, color: "#ef4444", bgcolor: "#fef2f2", px: 1, py: 0.2, borderRadius: "4px" }}>
                                    (Hisoblangan maosh)
                                </Typography>
                            </Box>

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                                sx={{ 
                                    height: 32, 
                                    fontSize: 13, 
                                    borderRadius: "6px", 
                                    width: 100,
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" }
                                }}
                            >
                                <MenuItem value="Aktiv">Aktiv</MenuItem>
                                <MenuItem value="Arxiv">Arxiv</MenuItem>
                            </Select>
                        </Box>

                        {/* GURUHLAR AKKORDEONLARI (KATTALASHUVCHI) */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {(() => {
                                const filteredGroups = (profile?.teacherGroups || [])
                                    .map(tg => tg.groups)
                                    .filter(g => {
                                        if (!g) return false;
                                        const isGroupActive = g.status === "active";
                                        return statusFilter === "Aktiv" ? isGroupActive : !isGroupActive;
                                    });

                                if (filteredGroups.length === 0) {
                                    return (
                                        <Typography sx={{ color: "#64748b", fontSize: 13, py: 3, textAlign: "center" }}>
                                            Guruhlar topilmadi
                                        </Typography>
                                    );
                                }

                                return filteredGroups.map((g) => (
                                    <Paper key={g.id} sx={{ 
                                        p: 2, 
                                        px: 3, 
                                        borderRadius: "12px", 
                                        border: "1px solid #e2e8f0", 
                                        boxShadow: "none", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "space-between",
                                        bgcolor: "#ffffff",
                                        "&:hover": { bgcolor: "#f8fafc" }
                                    }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                                {g.name}
                                            </Typography>
                                            <Typography sx={{ 
                                                fontSize: 11, 
                                                fontWeight: 600, 
                                                color: g.status === "active" ? "#22c55e" : "#64748b", 
                                                bgcolor: g.status === "active" ? "#f0fdf4" : "#f1f5f9", 
                                                border: g.status === "active" ? "1px solid #bbf7d0" : "1px solid #cbd5e1", 
                                                px: 1, 
                                                borderRadius: "4px" 
                                            }}>
                                                {g.status === "active" ? "Aktiv" : g.status === "completed" ? "Yakunlangan" : "Rejalashtirilgan"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, color: "#ef4444" }}>
                                                (Hisoblangan maosh)
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ color: "#0f172a" }}>
                                            <AddIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </Paper>
                                ));
                            })()}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}