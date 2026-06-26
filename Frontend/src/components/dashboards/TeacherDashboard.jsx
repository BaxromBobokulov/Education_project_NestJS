import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    IconButton,
    Badge,
    Collapse
} from "@mui/material";
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey'; // Logo o'rniga
import LayersIcon from '@mui/icons-material/Layers'; // Guruhlar
import PersonIcon from '@mui/icons-material/Person'; // Profil
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import GuruhTafsilotlariTeacher from "../../pages/teacherPages/GuruhTafsilotlariTeacher";
import GuruhTafsilotlari from "../../pages/GuruhTafsilotlari";
import TeacherProfile from "../../pages/teacherPages/TeacherProfile"
import { getCurrentUser, logout } from "../../utils/auth";

const DRAWER_OPEN_WIDTH = 240;
const DRAWER_CLOSE_WIDTH = 70; // Yopilgandagi eni (Rasmga mos)

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const [mainDrawer, setMainDrawer] = useState(true); // Sidebar holati
    const [openGroups, setOpenGroups] = useState(true); // Akkordeon holati
    const [activeNav, setActiveNav] = useState("guruhlar"); // Qaysi sahifa faolligi
    const [view, setView] = useState("list");
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const renderContent = () => {
        if (activeNav === "guruhlar" || activeNav === "yigilayotgan") {
            if (view === "detail" && selectedGroupId) {
                return <GuruhTafsilotlari groupId={selectedGroupId} onBack={() => setView("list")} />;
            }
            return (
                <GuruhTafsilotlariTeacher
                    onGroupClick={(group) => {
                        setSelectedGroupId(group.id);
                        setView("detail");
                    }}
                />
            );
        }
        if (activeNav === "profil") return (
            <TeacherProfile />
        );
        return null;
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff", fontFamily: "sans-serif" }}>

            {/* CHAP TOMON: DYNAMIC SIDEBAR (DRAWER) */}
            <Box sx={{
                width: mainDrawer ? DRAWER_OPEN_WIDTH : DRAWER_CLOSE_WIDTH,
                borderRight: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#ffffff",
                transition: "width 0.2s ease-in-out",
                overflowX: "hidden"
            }}>
                {/* Logo va Tizgich */}
                <Box sx={{
                    px: mainDrawer ? 3 : 0,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: mainDrawer ? "space-between" : "center"
                }}>
                    {mainDrawer && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <KeyboardCommandKeyIcon sx={{ color: "#22c55e", fontSize: 24 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#1e293b", letterSpacing: '-0.3px' }}>
                                Najot Ta'lim
                            </Typography>
                        </Box>
                    )}
                    {!mainDrawer && <KeyboardCommandKeyIcon sx={{ color: "#22c55e", fontSize: 24, mb: 1 }} />}

                    {mainDrawer && (
                        <IconButton size="small" onClick={() => setMainDrawer(false)} sx={{ color: "#64748b" }}>
                            <MenuOpenIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    )}
                </Box>

                {/* Navigatsiya ro'yxati */}
                <List sx={{ px: mainDrawer ? 2 : 1, pt: 1, flex: 1 }}>

                    {/* 1. GURUHLAR (AKKORDEON BOSHI) */}
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                if (!mainDrawer) setMainDrawer(true); // Yopiq bo'lsa ochadi
                                setOpenGroups(!openGroups);
                            }}
                            sx={{
                                borderRadius: "8px",
                                color: (activeNav === "guruhlar" || activeNav === "yigilayotgan") ? "#10b981" : "#64748b",
                                "&:hover": { bgcolor: "#f8fafc" },
                                py: 1,
                                px: 1.5,
                                justifyContent: mainDrawer ? "initial" : "center"
                            }}
                        >
                            <ListItemIcon sx={{
                                color: (activeNav === "guruhlar" || activeNav === "yigilayotgan") ? "#10b981" : "#64748b",
                                minWidth: mainDrawer ? 32 : "auto"
                            }}>
                                <LayersIcon sx={{ fontSize: 20 }} />
                            </ListItemIcon>
                            {mainDrawer && <ListItemText primary="Guruhlarim" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />}
                            {mainDrawer && (openGroups ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />)}
                        </ListItemButton>
                    </ListItem>

                    {/* AKKORDEON ICHKI ELEMENTLARI */}
                    <Collapse in={openGroups && mainDrawer} timeout="auto" unmountOnExit>
                        <List sx={{ pl: 2, py: 0 }}>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => { setActiveNav("guruhlar"); setView("list"); }}
                                    sx={{
                                        borderRadius: "8px",
                                        bgcolor: activeNav === "guruhlar" ? "#e2f6ec" : "transparent",
                                        color: activeNav === "guruhlar" ? "#059669" : "#64748b",
                                        py: 0.8,
                                        px: 1.5,
                                        "&:hover": { bgcolor: activeNav === "guruhlar" ? "#dbf4e7" : "#f8fafc" }
                                    }}
                                >
                                    <ListItemText primary="Guruhlar" primaryTypographyProps={{ fontSize: 13, fontWeight: activeNav === "guruhlar" ? 500 : 400 }} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => { setActiveNav("yigilayotgan"); setView("list"); }}
                                    sx={{
                                        borderRadius: "8px",
                                        bgcolor: activeNav === "yigilayotgan" ? "#e2f6ec" : "transparent",
                                        color: activeNav === "yigilayotgan" ? "#059669" : "#64748b",
                                        py: 0.8,
                                        px: 1.5,
                                        "&:hover": { bgcolor: activeNav === "yigilayotgan" ? "#dbf4e7" : "#f8fafc" }
                                    }}
                                >
                                    <ListItemText primary="Yig'ilayotgan guruhlar" primaryTypographyProps={{ fontSize: 13, fontWeight: activeNav === "yigilayotgan" ? 500 : 400 }} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Collapse>

                    {/* 2. PROFIL */}
                    <ListItem disablePadding sx={{ mb: 0.5, mt: 1 }}>
                        <ListItemButton
                            onClick={() => setActiveNav("profil")}
                            sx={{
                                borderRadius: "8px",
                                color: activeNav === "profil" ? "#10b981" : "#64748b",
                                "&:hover": { bgcolor: "#f8fafc" },
                                py: 1,
                                px: 1.5,
                                justifyContent: mainDrawer ? "initial" : "center"
                            }}
                        >
                            <ListItemIcon sx={{
                                color: activeNav === "profil" ? "#10b981" : "#64748b",
                                minWidth: mainDrawer ? 32 : "auto"
                            }}>
                                <PersonIcon sx={{ fontSize: 20 }} />
                            </ListItemIcon>
                            {mainDrawer && <ListItemText primary="Profil" primaryTypographyProps={{ fontSize: 14, fontWeight: activeNav === "profil" ? 500 : 400 }} />}
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

            {/* O'NG TOMON: HEADER VA KONTENT */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, bgcolor: "#fafafa" }}>

                {/* TEPPA PANEL (HEADER) */}
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 4,
                    py: 1.5,
                    bgcolor: "white",
                    borderBottom: "1px solid #f1f5f9",
                    justifyContent: "space-between"
                }}>
                    {/* Yopilganda ochish tugmasi */}
                    <Box>
                        {!mainDrawer && (
                            <IconButton size="small" onClick={() => setMainDrawer(true)} sx={{ color: "#64748b" }}>
                                <MenuIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                        )}
                    </Box>

                    {/* O'ng tomon: Profil & Notif */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <IconButton size="small" sx={{ color: "#64748b" }}>
                            <Badge badgeContent="9+" color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                                <NotificationsNoneIcon sx={{ fontSize: 24 }} />
                            </Badge>
                        </IconButton>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
                            <Avatar
                                src={user.photo ? `http://localhost:3000/user/image/${user.photo}` : undefined}
                                sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700 }}
                            >
                                {!user.photo && user.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>
                                {user?.first_name || "Baxrom"} {user.last_name || "Teacher"}
                            </Typography>
                            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        </Box>
                    </Box>
                </Box>

                {/* SAHIFA KONTENTI */}
                <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
                    {renderContent()}
                </Box>
            </Box>
        </Box>
    );
}