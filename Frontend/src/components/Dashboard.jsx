import { useState } from "react";
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
    Select,
    MenuItem,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputBase,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SendIcon from "@mui/icons-material/Send";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HelpIcon from "@mui/icons-material/Help";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import Xonalar from "../pages/Xonalar";
import Kurslar from "../pages/Kurslar";
import Oqituvchilar from "../pages/Oqituvchilar";
import Talabalar from "../pages/Talabalar";
import Guruhlar from "../pages/Guruhlar";
import GuruhTafsilotlari from "../pages/GuruhTafsilotlari";

const DRAWER_WIDTH = 220;
const SUB_DRAWER_WIDTH = 240;

const navItems = [
    { label: "Asosiy", icon: <HomeIcon fontSize="small" /> },
    { label: "O'qituvchilar", icon: <PeopleIcon fontSize="small" /> },
    { label: "Guruhlar", icon: <SchoolIcon fontSize="small" /> },
    { label: "Talabalar", icon: <PersonIcon fontSize="small" /> },
    { label: "Sovg'alar", icon: <CardGiftcardIcon fontSize="small" /> },
    { label: "Moliya", icon: <MonetizationOnIcon fontSize="small" /> },
    { label: "Boshqarish", icon: <ManageAccountsIcon fontSize="small" /> },
];

const boshqaruvItems = [
    { label: "Kurslar", icon: <MenuBookIcon fontSize="small" /> },
    { label: "Xonalar", icon: <MeetingRoomIcon fontSize="small" /> },
    { label: "Xodimlar", icon: <BadgeIcon fontSize="small" /> },
    { label: "Sabablar", icon: <ReportProblemIcon fontSize="small" /> },
    { label: "Xabar Yuborish", icon: <SendIcon fontSize="small" /> },
    { label: "FAQ", icon: <HelpIcon fontSize="small" /> },
    { label: "Tekshiruv", icon: <FactCheckIcon fontSize="small" /> },
];

const stats = [
    { label: "Sinflar", value: 0, icon: <SchoolIcon sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Fanlar", value: 0, icon: <MenuBookIcon sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Talabalar", value: 1, icon: <PersonIcon sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Sovg'alar", value: 3, icon: <CalendarMonthIcon sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "O'qituvchilar", value: 0, icon: <PeopleIcon sx={{ color: "#7c3aed", fontSize: 28 }} /> },
];

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState(0);
    const [language, setLanguage] = useState("O'zbekcha");
    const [darkMode, setDarkMode] = useState(false);
    const [activeSub, setActiveSub] = useState(null);
    // Main left drawer — only closes via ← button
    const [mainDrawer, setMainDrawer] = useState(true);
    // Second "Menu" drawer — opens when Boshqarish is clicked
    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("list"); // list | detail
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    const isBoshqarish = activeNav === 6;

    // Main nav click
    const handleNavClick = (idx) => {
        setActiveNav(idx);
        setView("list");
        setSelectedGroupId(null);
        if (idx === 6) {
            // Open second menu drawer, keep main drawer as-is
            setSubMenuOpen(true);
            setActiveSub(null);
        } else {
            // Normal nav: close second menu, clear sub
            setSubMenuOpen(false);
            setActiveSub(null);
        }
    };

    // Sub-menu item clicked → close second drawer, show content
    const handleSubItemClick = (label) => {
        setActiveSub(label);
        setSubMenuOpen(false);
    };

    const renderContent = () => {
        if (!isBoshqarish) {
            if (activeNav === 1) return <Oqituvchilar />;
            if (activeNav === 2) {
                if (view === "detail" && selectedGroupId) {
                    return <GuruhTafsilotlari groupId={selectedGroupId} onBack={() => setView("list")} />;
                }
                return <Guruhlar onGroupClick={(group) => {
                    setSelectedGroupId(group.id);
                    setView("detail");
                }} />;
            }
            if (activeNav === 3) return <Talabalar />;
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.4 }}>
                        Salom, dasturchi!
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mb: 3 }}>
                        Najot ta'lim platformasiga xush kelibsiz!
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                        {stats.map((stat) => (
                            <Card
                                key={stat.label}
                                sx={{
                                    flex: "1 1 140px",
                                    borderRadius: 3,
                                    boxShadow: "none",
                                    border: "1px solid #e2e8f0",
                                    bgcolor: "white",
                                }}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                                    <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>{stat.label}</Typography>
                                    <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#1e293b" }}>{stat.value}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <Accordion sx={{ borderRadius: "12px !important", boxShadow: "none", border: "1px solid #e2e8f0", bgcolor: "white", "&:before": { display: "none" } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>Dars Jadvali</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2.5 }}>
                            <Typography sx={{ fontSize: 13, color: "#64748b" }}>Hozircha dars jadvali mavjud emas.</Typography>
                        </AccordionDetails>
                    </Accordion>
                </>
            );
        }

        if (activeSub === "Kurslar") return <Kurslar />;
        if (activeSub === "Xonalar") return <Xonalar />;
        if (activeSub === "O'qituvchilar") return <Oqituvchilar />;

        return (
            <Box sx={{ textAlign: "center", mt: 8, color: "#94a3b8" }}>
                <ManageAccountsIcon sx={{ fontSize: 60, mb: 2, color: "#e2e8f0" }} />
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>Bo'lim tanlang</Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>

            {/* ══════════════ ASOSIY CHAP DRAWER ══════════════
                permanent — hech qachon avtomatik yopilmaydi
                faqat ← tugmasi bilan yopiladi
            */}
            <Drawer
                variant="permanent"
                sx={{
                    width: mainDrawer ? DRAWER_WIDTH : 0,
                    flexShrink: 0,
                    transition: "width 0.25s ease",
                    "& .MuiDrawer-paper": {
                        width: mainDrawer ? DRAWER_WIDTH : 0,
                        boxSizing: "border-box",
                        bgcolor: "#ffffff",
                        borderRight: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        overflowX: "hidden",
                        transition: "width 0.25s ease",
                    },
                }}
            >
                {/* Logo + ← tugmasi */}
                <Box
                    sx={{
                        minWidth: DRAWER_WIDTH,
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f1f5f9",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "#7c3aed",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 20, lineHeight: 1 }}>N</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b", lineHeight: 1.2 }}>Najot ta'lim</Typography>
                        </Box>
                    </Box>

                    {/* ← Yopish tugmasi — faqat DRAWER ICHIDA */}
                    <IconButton
                        size="small"
                        onClick={() => setMainDrawer(false)}
                        sx={{
                            color: "#94a3b8",
                            bgcolor: "#f8fafc",
                            borderRadius: "8px",
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            "&:hover": { bgcolor: "#e2e8f0", color: "#475569" },
                        }}
                    >
                        <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Nav items */}
                <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
                    {navItems.map((item, idx) => (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavClick(idx)}
                                sx={{
                                    borderRadius: "10px",
                                    bgcolor: activeNav === idx ? "#7c3aed" : "transparent",
                                    color: activeNav === idx ? "white" : "#64748b",
                                    "&:hover": { bgcolor: activeNav === idx ? "#6d28d9" : "#f1f5f9" },
                                    py: 1,
                                    px: 1.5,
                                    minWidth: DRAWER_WIDTH - 24,
                                }}
                            >
                                <ListItemIcon sx={{ color: activeNav === idx ? "white" : "#64748b", minWidth: 34 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 13, fontWeight: activeNav === idx ? 600 : 400 }}
                                />
                                {/* Ko'zni tashlaganda "Moliya" yonida biron nishon bo'lishi mumkin */}
                                {item.label === "Moliya" && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f59e0b", ml: 1 }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* ══════════════ IKKINCHI "MENU" DRAWER ══════════════
                Temporary overlay — Boshqarish bosganda paydo bo'ladi
                asosiy chap drawer ustida ochiladi
            */}
            <Drawer
                anchor="left"
                open={subMenuOpen}
                onClose={() => setSubMenuOpen(false)}
                sx={{
                    zIndex: 1300,
                    "& .MuiDrawer-paper": {
                        width: SUB_DRAWER_WIDTH,
                        left: mainDrawer ? DRAWER_WIDTH : 0,
                        boxSizing: "border-box",
                        bgcolor: "#ffffff",
                        boxShadow: "4px 0 20px rgba(0,0,0,0.12)",
                        borderRight: "none",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "12px",
                    },
                    "& .MuiBackdrop-root": {
                        left: mainDrawer ? DRAWER_WIDTH : 0,
                        bgcolor: "rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Menu header */}
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f1f5f9",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => setSubMenuOpen(false)}
                            sx={{
                                bgcolor: "#7c3aed",
                                color: "white",
                                borderRadius: "8px",
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: "#6d28d9" },
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Menu</Typography>
                    </Box>
                </Box>

                {/* Sub-menu items */}
                <List sx={{ px: 1.5, pt: 1, flex: 1 }}>
                    {boshqaruvItems.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleSubItemClick(item.label)}
                                sx={{
                                    borderRadius: "10px",
                                    color: activeSub === item.label ? "#7c3aed" : "#475569",
                                    bgcolor: activeSub === item.label ? "#f3e8ff" : "transparent",
                                    "&:hover": { bgcolor: "#f3e8ff", color: "#7c3aed" },
                                    py: 1,
                                    px: 1.5,
                                }}
                            >
                                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: 13.5,
                                        fontWeight: activeSub === item.label ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* ══════════════ MAIN CONTENT AREA ══════════════ */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        bgcolor: "white",
                        borderBottom: "1px solid #e2e8f0",
                        gap: 1.5,
                        position: "sticky",
                        top: 0,
                        zIndex: 200,
                    }}
                >
                    {/* ☰ Ochish — faqat main drawer yopiq bo'lganda */}
                    {!mainDrawer && (
                        <IconButton
                            size="small"
                            onClick={() => setMainDrawer(true)}
                            sx={{
                                bgcolor: "#7c3aed",
                                color: "white",
                                borderRadius: "8px",
                                width: 34,
                                height: 34,
                                "&:hover": { bgcolor: "#6d28d9" },
                                flexShrink: 0,
                            }}
                        >
                            <MenuIcon fontSize="small" />
                        </IconButton>
                    )}

                    {/* Search */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            flex: 1,
                            maxWidth: 340,
                            gap: 1,
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        <InputBase
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ fontSize: 13, color: "#1e293b", flex: 1 }}
                        />
                    </Box>

                    <Box sx={{ flex: 1 }} />
                    <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        size="small"
                        sx={{ fontSize: 12, height: 34, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" } }}
                    >
                        <MenuItem value="O'zbekcha" sx={{ fontSize: 12 }}>O'zbekcha</MenuItem>
                        <MenuItem value="Русский" sx={{ fontSize: 12 }}>Русский</MenuItem>
                        <MenuItem value="English" sx={{ fontSize: 12 }}>English</MenuItem>
                    </Select>

                    <IconButton size="small" onClick={() => setDarkMode(!darkMode)} sx={{ bgcolor: "#f1f5f9", borderRadius: 2 }}>
                        {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>

                    <Avatar sx={{ width: 34, height: 34, bgcolor: "#7c3aed", fontSize: 14 }}>C</Avatar>
                </Box>

                {/* Page content */}
                <Box sx={{ p: isBoshqarish && activeSub ? 3 : 3, flex: 1 }}>
                    {isBoshqarish && activeSub && (
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 2.5, fontSize: 30, mr: 100 }}>
                            Boshqarish
                        </Typography>
                    )}
                    {/* ── Horizontal tab bar — Boshqarish & sub-item tanlanganda ── */}
                    {isBoshqarish && activeSub && (
                        <Box
                            sx={{
                                bgcolor: "#f1f5f9",
                                px: 2,
                                py: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 0,
                                overflowX: "auto",
                                "&::-webkit-scrollbar": { display: "none" },
                            }}
                        >
                            {boshqaruvItems.map((sub) => (
                                <Box
                                    key={sub.label}
                                    onClick={() => handleSubItemClick(sub.label)}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        fontSize: 13,
                                        fontWeight: activeSub === sub.label ? 600 : 400,
                                        color: activeSub === sub.label ? "#7c3aed" : "#475569",
                                        cursor: "pointer",
                                        borderBottom: activeSub === sub.label ? "2px solid #7c3aed" : "2px solid transparent",
                                        transition: "all 0.15s",
                                        whiteSpace: "nowrap",
                                        "&:hover": { color: "#7c3aed" },
                                    }}
                                >
                                    {sub.label}
                                </Box>
                            ))}
                        </Box>
                    )}
                    {renderContent()}
                </Box>
            </Box>
        </Box>
    );
}