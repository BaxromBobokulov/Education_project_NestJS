import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Pagination,
    Select,
    MenuItem,
    Slider,
    CircularProgress
} from "@mui/material";
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; // Ustunlarni sozlash ikonkiasi
import { getCurrentUser } from "../../utils/auth";
import axios from "axios";

const BASE = "http://localhost:3000";

const daysMap = {
    MONDAY: "Du",
    TUESDAY: "Se",
    WEDNESDAY: "Ch",
    THURSDAY: "Pa",
    FRIDAY: "Ju",
    SATURDAY: "Sh",
    SUNDAY: "Ya"
};

export default function Guruhlar({ onGroupClick }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchGroups = async () => {
            const user = getCurrentUser();
            if (!user || !user.id) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE}/groups/${user.id}/teacher-groups`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Map API response to match UI fields
                const formattedGroups = (res.data || []).map((item) => {
                    const g = item.groups;
                    if (!g) return null;

                    const weekDays = Array.isArray(g.week_day) ? g.week_day : (g.week_day ? [g.week_day] : []);
                    const weekDaysStr = weekDays.map(d => daysMap[d] || d).join(", ");
                    const jadval = `${g.start_time || ''}\n${weekDaysStr}`;

                    return {
                        id: g.id,
                        name: g.name,
                        filial: g.rooms?.name || "Chilonzor",
                        kurs: g.courses?.name || "Bootcamp Foundation",
                        yonalish: "Programming",
                        masul: `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Abdulqodir Ashurov",
                        soat: g.courses?.duration_hours ? `${g.courses.duration_hours} soat` : "200 soat",
                        tur: "BOOTCAMP",
                        sana: g.start_date || "30.04.2026",
                        jadval: jadval
                    };
                }).filter(Boolean);

                setGroups(formattedGroups);
            } catch (err) {
                console.error("Guruhlarni yuklashda xatolik:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setPage(1);
    };

    const startIndex = (page - 1) * perPage;
    const paginatedGroups = groups.slice(startIndex, startIndex + perPage);

    return (
        <Box sx={{ width: "100%", bgcolor: "transparent" }}>
            
            {/* Sarlavha */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}>
                Guruhlar
            </Typography>

            {/* Asosiy Karta Konteyneri */}
            <Paper sx={{ 
                width: "100%", 
                borderRadius: "12px", 
                border: "1px solid #e2e8f0", 
                boxShadow: "none",
                overflow: "hidden",
                bgcolor: "#ffffff"
            }}>
                
                {/* Ustunlarni sozlash paneli (Faqat vizual ko'rinish uchun rasmga moslandi) */}
                <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderBottom: "1px solid #f1f5f9" }}>
                    <Button
                        variant="outlined"
                        startIcon={<ViewColumnIcon sx={{ transform: "rotate(90deg)" }} />}
                        sx={{
                            color: "#64748b",
                            borderColor: "#cbd5e1",
                            textTransform: "none",
                            borderRadius: "8px",
                            fontSize: 13,
                            fontWeight: 500,
                            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                            px: 2,
                            py: 0.6
                        }}
                    >
                        Ustunlarni sozlash
                    </Button>
                </Box>

                {/* Jadval qismi */}
                <TableContainer sx={{ overflowX: "auto" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : (
                        <Table sx={{ minWidth: 1000, borderCollapse: "collapse" }}>
                            <TableHead sx={{ bgcolor: "#ffffff" }}>
                                <TableRow>
                                    {[
                                        "Guruh nomi", "Filial", "Kurs", "Yo'nalish", 
                                        "Mas'ul", "Ak. soat", "O'quv turi", "Boshlangan sana", "Jadval"
                                    ].map((head) => (
                                        <TableCell 
                                            key={head} 
                                            sx={{ color: "#64748b", fontSize: 13, fontWeight: 500, borderBottom: "1px solid #f1f5f9", py: 2 }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedGroups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: "#64748b" }}>
                                            Guruhlar topilmadi
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedGroups.map((group) => (
                                        <TableRow key={group.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                                            
                                            {/* Guruh nomi - Ustiga bossa tafsilotga o'tadigan link */}
                                            <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 2.5 }}>
                                                <Typography 
                                                    onClick={() => onGroupClick && onGroupClick(group)}
                                                    sx={{ 
                                                        color: "#2563eb", 
                                                        fontSize: 14, 
                                                        fontWeight: 500, 
                                                        cursor: "pointer",
                                                        "&:hover": { textDecoration: "underline" }
                                                    }}
                                                >
                                                    {group.name}
                                                </Typography>
                                            </TableCell>
                                            
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.filial}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.kurs}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.yonalish}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.masul}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.soat}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #f1f5f9" }}>{group.tur}</TableCell>
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>{group.sana}</TableCell>
                                            
                                            {/* Jadval (Yozuvlar chiroyli sinishi uchun whiteSpace saqlandi) */}
                                            <TableCell sx={{ color: "#0f172a", fontSize: 13, borderBottom: "1px solid #f1f5f9", whiteSpace: "pre-line", lineHeight: 1.4 }}>
                                                {group.jadval}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Rasmning pastki qismidagi kulrang Scroll imitatsiyasi (MUI Slider uslubida) */}
                <Box sx={{ px: 3, pt: 1, pb: 0.5 }}>
                    <Slider 
                        defaultValue={20} 
                        disabled 
                        sx={{ 
                            height: 6, 
                            color: "#cbd5e1", 
                            "& .MuiSlider-thumb": { display: "none" },
                            "& .MuiSlider-track": { bgcolor: "#94a3b8" }
                        }} 
                    />
                </Box>

                {/* FOOTER: PAGINATION & INFO COUNTER */}
                <Box sx={{ 
                    p: 2, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    flexWrap: "wrap",
                    gap: 2 
                }}>
                    {/* Statistik matn */}
                    <Typography sx={{ color: "#0f172a", fontSize: 13, fontWeight: 400 }}>
                        Berilgan mezonlar bo'yicha {groups.length} ta guruh topildi
                    </Typography>

                    {/* O'ng tomon: Sahifalash va filter */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Pagination 
                            count={Math.ceil(groups.length / perPage) || 1} 
                            page={page}
                            onChange={(e, val) => setPage(val)}
                            shape="rounded" 
                            size="small"
                            sx={{
                                "& .MuiPaginationItem-root.Mui-selected": {
                                    bgcolor: "#10b981",
                                    color: "white",
                                    "&:hover": { bgcolor: "#059669" }
                                }
                            }}
                        />
                        <Select
                            value={perPage}
                            onChange={handlePerPageChange}
                            size="small"
                            sx={{ 
                                fontSize: 13, 
                                color: "#334155", 
                                height: 32, 
                                borderRadius: "6px",
                                bgcolor: "#ffffff",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" }
                            }}
                        >
                            <MenuItem value={10}>10 / page</MenuItem>
                            <MenuItem value={20}>20 / page</MenuItem>
                            <MenuItem value={50}>50 / page</MenuItem>
                        </Select>
                    </Box>
                </Box>

            </Paper>
        </Box>
    );
}