import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    IconButton,
    Badge,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";

// Ikonkalar
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PlayLessonOutlinedIcon from "@mui/icons-material/PlayLessonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import DiamondIcon from '@mui/icons-material/Diamond'; // Logotip o'rtasidagi naqsh uchun

import { getCurrentUser, logout } from "../../utils/auth";
import GroupsBelongStudent from "../studentsPanelComps/GroupsBelongStudent";
import StudentHomeworks from "../studentsPanelComps/StudentHomeworks";
import MainHomework from "../studentsPanelComps/MainHomework";

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 80;

const navItems = [
    { label: "Bosh sahifa", icon: <HomeOutlinedIcon /> },
    { label: "To'lovlarim", icon: <CreditCardOutlinedIcon /> },
    { label: "Guruhlarim", icon: <GroupsOutlinedIcon /> },
    { label: "Ko'rsatkichlarim", icon: <BarChartOutlinedIcon /> },
    { label: "Reyting", icon: <LeaderboardOutlinedIcon /> },
    { label: "Do`kon", icon: <ShoppingCartOutlinedIcon /> },
    { label: "Qo'shimcha darslar", icon: <PlayLessonOutlinedIcon /> },
    { label: "Sozlamalar", icon: <SettingsOutlinedIcon /> },
];

export default function StudentDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Rasmda 'Guruhlarim' 3-chi element, shuning uchun default index: 2
    const [activeNav, setActiveNav] = useState(2); 
    const [mainDrawer, setMainDrawer] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const renderMainContent = () => {
        if (selectedLesson) {
            return (
                <MainHomework 
                    lessonId={selectedLesson.id}
                    groupId={selectedGroup?.id}
                    groupName={selectedGroup?.name}
                    onBack={() => setSelectedLesson(null)}
                />
            );
        }

        if (selectedGroup) {
            return (
                <StudentHomeworks 
                    groupId={selectedGroup.id} 
                    groupName={selectedGroup.name} 
                    onBack={() => setSelectedGroup(null)} 
                    onLessonSelect={(lesson) => setSelectedLesson(lesson)}
                />
            );
        }

        return (
            <Box sx={{ p: 4 }}>
                {/* Tablar qismi */}
                <Box sx={{ display: "flex", gap: 4, mb: 3, borderBottom: "1px solid #E5E7EB" }}>
                    <Typography 
                        sx={{ 
                            pb: 1, 
                            fontWeight: 600, 
                            color: "#C4843D", 
                            borderBottom: "2px solid #C4843D", 
                            cursor: "pointer" 
                        }}
                    >
                        Faol
                    </Typography>
                    <Typography 
                        sx={{ 
                            pb: 1, 
                            fontWeight: 400, 
                            color: "#6B7280", 
                            cursor: "pointer",
                            "&:hover": { color: "#374151" }
                        }}
                    >
                        Tugagan
                    </Typography>
                </Box>

                {/* Jadval qismi */}
                <GroupsBelongStudent onGroupClick={(group) => setSelectedGroup(group)} />
            </Box>
        );
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#F3F4F6" }}>
            
            {/* Top Navbar */}
            <Box 
                sx={{ 
                    height: 72, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    px: { xs: 2, md: 4 }, 
                    bgcolor: "#ffffff", 
                    borderBottom: "1px solid #E5E7EB",
                    zIndex: 1201 // Drawer ustida turishi uchun
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {/* Logotip */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, position: "relative", width: DRAWER_WIDTH - 60 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: 22, letterSpacing: 1, color: "#111827", fontFamily: "sans-serif" }}>
                            NAJOT
                        </Typography>
                        <DiamondIcon sx={{ color: "#C4843D", fontSize: 24, mx: 0.5 }} />
                        <Typography sx={{ fontWeight: 500, fontSize: 22, letterSpacing: 1, color: "#111827", fontFamily: "sans-serif" }}>
                            TA'LIM
                        </Typography>
                        {/* Beta yozuvi */}
                        <Box 
                            sx={{ 
                                position: "absolute", 
                                top: -8, 
                                right: -36, 
                                bgcolor: "#F5A623", 
                                color: "#000", 
                                fontSize: 11, 
                                fontWeight: 600, 
                                px: 0.8, 
                                py: 0.2, 
                                borderRadius: 3 
                            }}
                        >
                            Beta
                        </Box>
                    </Box>

                    {/* Hamburger Tugma */}
                    <IconButton 
                        onClick={() => setMainDrawer(!mainDrawer)} 
                        sx={{ 
                            bgcolor: "#CBA373", 
                            color: "#fff", 
                            borderRadius: "10px", 
                            boxShadow: "0 4px 10px rgba(196, 132, 61, 0.3)", 
                            "&:hover": { bgcolor: "#B88E5F" }, 
                            width: 33, 
                            height: 33,
                            left: "30px"
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>

                {/* O'ng tomon ikonkalari */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Badge badgeContent={21} sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontWeight: 600 } }}>
                        <NotificationsNoneOutlinedIcon sx={{ color: "#6B7280", fontSize: 28, cursor: "pointer", "&:hover": { color: "#374151" } }} />
                    </Badge>
                    <IconButton onClick={handleLogout} sx={{ color: "#6B7280", "&:hover": { color: "#374151" } }}>
                        <LogoutOutlinedIcon sx={{ fontSize: 26 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Asosiy qism: Sidebar + Kontent */}
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                
                {/* Sidebar (Drawer) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: mainDrawer ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
                        flexShrink: 0,
                        transition: "width 0.3s ease",
                        "& .MuiDrawer-paper": {
                            width: mainDrawer ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
                            transition: "width 0.3s ease",
                            boxSizing: "border-box",
                            position: "relative",
                            borderRight: "none",
                            bgcolor: "#ffffff",
                            overflowX: "hidden",
                            pt: 2
                        },
                    }}
                >
                    <List sx={{ px: 1.5 }}>
                        {navItems.map((item, idx) => {
                            const isActive = activeNav === idx;
                            return (
                                <ListItem key={item.label} disablePadding sx={{ display: "block", mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => {
                                            setActiveNav(idx);
                                            setSelectedGroup(null);
                                        }}
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: mainDrawer ? "initial" : "center",
                                            px: 2.5,
                                            borderRadius: "10px",
                                            bgcolor: isActive ? "#FAF3EB" : "transparent",
                                            color: isActive ? "#C4843D" : "#6B7280",
                                            "&:hover": { 
                                                bgcolor: isActive ? "#FAF3EB" : "#F3F4F6" 
                                            },
                                        }}
                                    >
                                        <ListItemIcon 
                                            sx={{ 
                                                minWidth: 0, 
                                                mr: mainDrawer ? 2 : 0, 
                                                justifyContent: "center", 
                                                color: "inherit" 
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        
                                        <ListItemText 
                                            primary={item.label} 
                                            primaryTypographyProps={{ 
                                                fontSize: 15, 
                                                fontWeight: isActive ? 500 : 400 
                                            }}
                                            sx={{ 
                                                opacity: mainDrawer ? 1 : 0, 
                                                display: mainDrawer ? "block" : "none" 
                                            }} 
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Drawer>

                {/* Dinamik Kontent Qismi */}
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {renderMainContent()}
                </Box>
            </Box>
        </Box>
    );
}