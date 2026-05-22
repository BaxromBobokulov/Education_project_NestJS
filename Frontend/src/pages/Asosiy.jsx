import {
    Box,
    Card,
    CardContent,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const stats = [
    { label: "Sinflar",       value: 0, icon: <SchoolIcon        sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Fanlar",        value: 0, icon: <MenuBookIcon       sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Talabalar",     value: 1, icon: <PersonIcon         sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "Sovg'alar",     value: 3, icon: <CalendarMonthIcon  sx={{ color: "#7c3aed", fontSize: 28 }} /> },
    { label: "O'qituvchilar", value: 0, icon: <PeopleIcon         sx={{ color: "#7c3aed", fontSize: 28 }} /> },
];

const schedule = [
    { kun: "Dushanba",  fan: "Matematika",   vaqt: "08:00 - 09:30", xona: "101-xona", holat: "Aktiv" },
    { kun: "Seshanba",  fan: "Fizika",        vaqt: "10:00 - 11:30", xona: "203-xona", holat: "Aktiv" },
    { kun: "Chorshanba",fan: "Informatika",   vaqt: "09:00 - 10:30", xona: "Lab-1",    holat: "Kutilmoqda" },
    { kun: "Payshanba", fan: "Ingliz tili",   vaqt: "11:00 - 12:30", xona: "302-xona", holat: "Aktiv" },
    { kun: "Juma",      fan: "Tarix",         vaqt: "08:30 - 10:00", xona: "105-xona", holat: "Kutilmoqda" },
];

export default function Asosiy() {
    return (
        <Box>
            {/* Greeting */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.4 }}>
                Salom, creator!
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 3 }}>
                EduCoin platfomasiga xush kelibsiz!
            </Typography>

            {/* Stats Cards */}
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
                            transition: "box-shadow 0.2s, transform 0.2s",
                            "&:hover": {
                                boxShadow: "0 4px 20px rgba(124,58,237,0.12)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", py: 3 }}>
                            <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                            <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                                {stat.label}
                            </Typography>
                            <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#1e293b" }}>
                                {stat.value}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Dars Jadvali Accordion */}
            <Accordion
                sx={{
                    borderRadius: "12px !important",
                    boxShadow: "none",
                    border: "1px solid #e2e8f0",
                    bgcolor: "white",
                    "&:before": { display: "none" },
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                        Dars Jadvali
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {["Kun", "Fan", "Vaqt", "Xona", "Holat"].map((h) => (
                                    <TableCell
                                        key={h}
                                        sx={{ fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {schedule.map((row, i) => (
                                <TableRow
                                    key={i}
                                    sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                                >
                                    <TableCell sx={{ fontSize: 13, color: "#1e293b" }}>{row.kun}</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#1e293b" }}>{row.fan}</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b" }}>{row.vaqt}</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b" }}>{row.xona}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.holat}
                                            size="small"
                                            sx={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                bgcolor: row.holat === "Aktiv" ? "#dcfce7" : "#fef9c3",
                                                color:   row.holat === "Aktiv" ? "#16a34a" : "#a16207",
                                                border: "none",
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}
