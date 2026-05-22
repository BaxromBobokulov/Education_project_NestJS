import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    Drawer,
    TextField,
    Select,
    MenuItem,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import axios from "axios";

const GET_API = "http://localhost:3000/courses/all";
const POST_API = "http://localhost:3000/courses";

const CARD_COLORS = ["#f8fafc", "#faf5ff", "#fefce8", "#f0fdf4", "#eff6ff", "#fdf4ff"];
const colors = ["#1e293b", "#7c3aed", "#dc2626", "#ea580c", "#16a34a", "#0284c7", "#4f46e5", "#9333ea", "#db2777"];

export default function Kurslar() {
    const [drawerOpen,     setDrawerOpen]     = useState(false);
    const [courses,        setCourses]        = useState([]);
    const [loading,        setLoading]        = useState(false);
    const [saving,         setSaving]         = useState(false);

    // Form state
    const [name,           setName]           = useState("");
    const [description,    setDescription]    = useState("");
    const [price,          setPrice]          = useState("");
    const [duration_hours, setDurationHours]  = useState("");
    const [duration_month, setDurationMonth]  = useState("");
    const [color,          setColor]          = useState("#f8fafc");

    const token = localStorage.getItem("token");

    // ── GET courses ──
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(GET_API, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("GET /courses/all error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    // ── POST course ──
    const saveCourse = async () => {
        if (!name || !duration_hours || !duration_month || !price) return;
        setSaving(true);
        try {
            await axios.post(
                POST_API,
                {
                    name,
                    description,
                    price: Number(price),
                    duration_hours: Number(duration_hours),
                    duration_month: Number(duration_month),
                    color,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Reset form
            setName(""); setDescription(""); setPrice("");
            setDurationHours(""); setDurationMonth(""); setColor("#f8fafc");
            setDrawerOpen(false);
            // Refresh list
            await fetchCourses();
        } catch (e) {
            console.error("POST /courses error:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", p: 3, border: "1px solid #e2e8f0" }}>

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: "#1e293b", fontSize: 22 }}>
                    Kurslar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        bgcolor: "#a855f7", textTransform: "none", borderRadius: "8px",
                        boxShadow: "none", px: 2, py: 0.8, fontSize: 13, fontWeight: 600,
                        "&:hover": { bgcolor: "#9333ea", boxShadow: "none" },
                    }}
                >
                    Kurs qo'shish
                </Button>
            </Box>

            {/* Courses Grid */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: "#a855f7" }} />
                </Box>
            ) : courses.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
                    Hozircha kurslar yo'q. Yangi kurs qo'shing!
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {courses.map((course, idx) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id ?? idx}>
                            <Card sx={{
                                boxShadow: "none",
                                bgcolor: course.color ? `${course.color}33` : CARD_COLORS[idx % CARD_COLORS.length],
                                borderRadius: "12px",
                                border: "1px solid rgba(0,0,0,0.04)",
                                width: "350px"
                            }}>
                                <CardContent sx={{ p: "16px !important" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                        <Box sx={{ pr: 1, flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#1e293b", mb: 0.5, lineHeight: 1.3 }}>
                                                {course.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: "#64748b", mb: 1.5, lineHeight: 1.4,
                                                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                {course.description}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 0, flexShrink: 0 }}>
                                            <IconButton size="small" sx={{ color: "#64748b", p: 0.5, "&:hover": { color: "#ef4444" } }}>
                                                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: "#64748b", p: 0.5, "&:hover": { color: "#3b82f6" } }}>
                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                                        <Box sx={{ bgcolor: "white", px: 1, py: 0.3, borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 500, color: "#475569" }}>
                                            {course.duration_hours} minut
                                        </Box>
                                        <Box sx={{ bgcolor: "white", px: 1, py: 0.3, borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 500, color: "#475569" }}>
                                            {course.duration_month} oy
                                        </Box>
                                        <Box sx={{ bgcolor: "white", px: 1, py: 0.3, borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 500, color: "#475569" }}>
                                            {Number(course.price).toLocaleString()} so'm
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Drawer — Kurs qo'shish */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: 380, display: "flex", flexDirection: "column" } }}
            >
                {/* Drawer Header */}
                <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1e293b" }}>
                            Kurs qo'shish
                        </Typography>
                        <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: "#64748b" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                        Bu yerda siz yangi Kurs qo'shishingiz mumkin.
                    </Typography>
                </Box>

                {/* Drawer Body */}
                <Box sx={{ p: 3, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Nomi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.8 }}>
                            Nomi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Bootcamp Foundation"
                            size="small"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Dars davomiyligi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.8 }}>
                            Dars davomiyligi (minut) <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Select
                            fullWidth size="small" displayEmpty
                            value={duration_hours}
                            onChange={(e) => setDurationHours(e.target.value)}
                            sx={{ borderRadius: "8px", fontSize: 14 }}
                        >
                            <MenuItem value="">Tanlang</MenuItem>
                            {[30, 45, 60, 90, 120].map((m) => (
                                <MenuItem key={m} value={m}>{m} minut</MenuItem>
                            ))}
                        </Select>
                    </Box>

                    {/* Kurs davomiyligi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.8 }}>
                            Kurs davomiyligi (oy) <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Select
                            fullWidth size="small" displayEmpty
                            value={duration_month}
                            onChange={(e) => setDurationMonth(e.target.value)}
                            sx={{ borderRadius: "8px", fontSize: 14 }}
                        >
                            <MenuItem value="">Tanlang</MenuItem>
                            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((m) => (
                                <MenuItem key={m} value={m}>{m} oy</MenuItem>
                            ))}
                        </Select>
                    </Box>

                    {/* Narx */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.8 }}>
                            Narx <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="1000000"
                            size="small"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoneyIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.8 }}>
                            Tavsif
                        </Typography>
                        <TextField
                            fullWidth multiline rows={3}
                            placeholder="Kurs haqida qisqacha..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Rang */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.2 }}>
                            Rangi
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#64748b", mb: 1.2, lineHeight: 1.3 }}>
                            Kurs kartochkasi uchun rang tanlang.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                            {colors.map((c, i) => (
                                <Box
                                    key={i}
                                    onClick={() => setColor(c)}
                                    sx={{
                                        width: 26, height: 26, borderRadius: "50%", bgcolor: c,
                                        cursor: "pointer", transition: "transform 0.1s",
                                        "&:hover": { transform: "scale(1.15)" },
                                        outline: color === c ? "3px solid #a855f7" : "none",
                                        outlineOffset: "2px",
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                </Box>

                {/* Drawer Footer */}
                <Box sx={{ p: 3, pt: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1.5, bgcolor: "white" }}>
                    <Button
                        variant="outlined"
                        onClick={() => setDrawerOpen(false)}
                        sx={{ borderColor: "#e2e8f0", color: "#1e293b", textTransform: "none", borderRadius: "8px", px: 3, py: 1, fontWeight: 500, fontSize: 13 }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveCourse}
                        disabled={saving || !name || !duration_hours || !duration_month || !price}
                        sx={{
                            bgcolor: "#a855f7", color: "white", textTransform: "none", borderRadius: "8px",
                            px: 3, py: 1, fontWeight: 500, fontSize: 13, boxShadow: "none",
                            "&:hover": { bgcolor: "#9333ea", boxShadow: "none" },
                        }}
                    >
                        {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}
