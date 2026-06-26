import { useState, useEffect } from "react";
import {
    Box, Typography, Button, IconButton, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, Checkbox, Drawer, Divider,
    Select, MenuItem, FormControl, InputLabel, OutlinedInput,
    Grid, Pagination, CircularProgress, Switch, FormControlLabel,
    Tooltip, Avatar,
    InputBase,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { useNotify } from "../components/NotificationContext";

const BASE = "http://localhost:3000";
const GET_GROUPS = `${BASE}/groups/all`;
const GET_ARXIV = `${BASE}/groups/arxiv`;
const POST_GROUPS = `${BASE}/groups`;
const GET_COURSES = `${BASE}/courses/all`;
const GET_ROOMS = `${BASE}/rooms/all`;
const GET_TEACHERS = `${BASE}/teachers/all`;
const GET_STUDENTS = `${BASE}/students/all`;

const WEEK_DAYS = [
    { key: "MONDAY", label: "Dushanba" },
    { key: "TUESDAY", label: "Seshanba" },
    { key: "WEDNESDAY", label: "Chorshanba" },
    { key: "THURSDAY", label: "Payshanba" },
    { key: "FRIDAY", label: "Juma" },
    { key: "SATURDAY", label: "Shanba" },
    { key: "SUNDAY", label: "Yakshanba" },
];

const WEEK_SHORT = {
    MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Chor",
    THURSDAY: "Pay", FRIDAY: "Ju", SATURDAY: "Sha", SUNDAY: "Yak"
};

export default function Guruhlar({ onGroupClick }) {
    const notify = useNotify();
    const [tab, setTab] = useState("guruhlar");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [groups, setGroups] = useState([]);
    const [arxiv, setArxiv] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [courseId, setCourseId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [teacherIds, setTeacherIds] = useState([]);
    const [studentIds, setStudentIds] = useState([]);
    const [weekDays, setWeekDays] = useState([]);
    const [startTime, setStartTime] = useState("09:00");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxStudent, setMaxStudent] = useState(20);

    // Edit / Delete holatlari
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await axios.get(GET_GROUPS, { headers });
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("GET /groups/all:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchArxiv = async () => {
        setLoading(true);
        try {
            const res = await axios.get(GET_ARXIV, { headers });
            setArxiv(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("GET /groups/arxiv:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            const [c, r, t, s] = await Promise.all([
                axios.get(GET_COURSES, { headers }),
                axios.get(GET_ROOMS, { headers }),
                axios.get(GET_TEACHERS, { headers }),
                axios.get(GET_STUDENTS, { headers }),
            ]);
            setCourses(Array.isArray(c.data) ? c.data : []);
            setRooms(Array.isArray(r.data) ? r.data : []);
            setTeachers(Array.isArray(t.data) ? t.data : []);
            setStudents(Array.isArray(s.data) ? s.data : []);
        } catch (e) {
            console.error("Lookup fetch error:", e);
        }
    };

    useEffect(() => { fetchGroups(); }, []);
    useEffect(() => { if (tab === "arxiv") fetchArxiv(); }, [tab]);
    useEffect(() => { if (drawerOpen) fetchLookups(); }, [drawerOpen]);

    const addGroup = async () => {
        if (!name || !courseId || !roomId || !startDate || weekDays.length === 0) return;
        setSaving(true);
        try {
            if (teacherIds.length === 0) {
                alert("O'qituvchini tanlang!");
                setSaving(false);
                return;
            }

            const payload = {
                name,
                description: description || undefined,
                course_id: Number(courseId),
                room_id: Number(roomId),
                start_date: startDate,
                week_day: weekDays,
                start_time: startTime,
                max_student: Number(maxStudent),
            };

            const response = await axios.post(POST_GROUPS, payload, { headers });
            const groupId = response.data.group_id || response.data.id;

            if (groupId) {
                // Attach teachers
                const teacherPromises = teacherIds.map((tid) =>
                    axios.post(`${BASE}/teacher-group`, {
                        teacher_id: Number(tid),
                        group_id: Number(groupId)
                    }, { headers })
                );

                // Attach students
                const studentPromises = studentIds.map((sid) =>
                    axios.post(`${BASE}/student-group`, {
                        user_id: Number(sid),
                        group_id: Number(groupId)
                    }, { headers })
                );

                await Promise.all([...teacherPromises, ...studentPromises]);
            }

            notify("Guruh muvaffaqiyatli yaratildi!", "success");

            setName(""); setDescription(""); setCourseId(""); setRoomId("");
            setTeacherIds([]); setStudentIds([]); setWeekDays([]);
            setStartTime("09:00"); setStartDate(""); setEndDate(""); setMaxStudent(20);
            setDrawerOpen(false);
            await fetchGroups();
        } catch (e) {
            const msg = e?.response?.data?.message || "Xato yuz berdi";
            notify(msg, "error");
            console.error("POST /groups:", e?.response?.data || e);
        } finally {
            setSaving(false);
        }
    };

    // === EDIT (PATCH /groups/:id) ===
    const openEditDrawer = (group) => {
        setEditingGroup(group);
        setEditDrawerOpen(true);
        // Lookups (courses, rooms) yuklash
        fetchLookups();
    };

    const closeEditDrawer = () => {
        setEditDrawerOpen(false);
        setEditingGroup(null);
    };

    const updateGroup = async () => {
        if (!editingGroup) return;
        if (!editingGroup.name || !editingGroup.course_id || !editingGroup.room_id || !editingGroup.start_date || !editingGroup.week_day?.length) {
            notify("Barcha majburiy maydonlarni to'ldiring", "error");
            return;
        }
        setUpdating(true);
        try {
            const payload = {
                name: editingGroup.name,
                description: editingGroup.description || undefined,
                course_id: Number(editingGroup.course_id),
                room_id: Number(editingGroup.room_id),
                start_date: editingGroup.start_date,
                week_day: Array.isArray(editingGroup.week_day) ? editingGroup.week_day : [editingGroup.week_day],
                start_time: editingGroup.start_time,
                max_student: Number(editingGroup.max_student),
            };

            await axios.patch(`${BASE}/groups/${editingGroup.id}`, payload, { headers });
            notify("Guruh muvaffaqiyatli yangilandi!", "success");
            closeEditDrawer();
            await fetchGroups();
        } catch (e) {
            const msg = e?.response?.data?.message || "Yangilashda xato yuz berdi";
            notify(msg, "error");
            console.error("PATCH /groups:", e?.response?.data || e);
        } finally {
            setUpdating(false);
        }
    };

    const toggleEditWeekDay = (key) => {
        if (!editingGroup) return;
        const current = Array.isArray(editingGroup.week_day) ? editingGroup.week_day : [editingGroup.week_day];
        const updated = current.includes(key)
            ? current.filter((d) => d !== key)
            : [...current, key];
        setEditingGroup({ ...editingGroup, week_day: updated });
    };

    // === DELETE (DELETE /groups/:id) ===
    const openDeleteDialog = (group) => {
        setDeletingGroup(group);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletingGroup(null);
    };

    const confirmDelete = async () => {
        if (!deletingGroup) return;
        setDeleting(true);
        try {
            await axios.delete(`${BASE}/groups/${deletingGroup.id}`, { headers });
            notify(`"${deletingGroup.name}" arxivga ko'chirildi`, "success");
            closeDeleteDialog();
            await fetchGroups();
        } catch (e) {
            const msg = e?.response?.data?.message || "O'chirishda xato yuz berdi";
            notify(msg, "error");
            console.error("DELETE /groups:", e?.response?.data || e);
        } finally {
            setDeleting(false);
        }
    };

    const displayList = tab === "guruhlar" ? groups : arxiv;
    const filtered = displayList.filter((g) => {
        const q = searchQuery.toLowerCase();
        return (
            (g.name || "").toLowerCase().includes(q) ||
            (g.courses?.name || "").toLowerCase().includes(q) ||
            (g.rooms?.name || "").toLowerCase().includes(q)
        );
    });

    const PER_PAGE = 10;
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    const allSelected = selected.length === filtered.length && filtered.length > 0;
    const toggleAll = () => setSelected(allSelected ? [] : filtered.map((g) => g.id));
    const toggleOne = (id) => setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    const toggleWeekDay = (key) => setWeekDays((prev) =>
        prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );

    const totalGroups = groups.length;
    const uniqueTeacher = new Set(groups.filter((g) => g.teacher?.id).map((g) => g.teacher.id)).size;
    const totalStudents = groups.reduce((acc, g) => acc + (g.studentGroups?.length || 0), 0);

    const formatWeekDays = (wd) => {
        if (!wd) return "—";
        const arr = Array.isArray(wd) ? wd : (typeof wd === "string" ? [wd] : []);
        return arr.map((d) => WEEK_SHORT[d] || d).join(", ");
    };

    const COURSE_COLORS = ["#fce7f3", "#e0f2fe", "#dcfce7", "#fef9c3", "#ede9fe", "#fee2e2", "#f0fdf4"];
    const COURSE_TEXT = ["#be185d", "#0369a1", "#15803d", "#a16207", "#6d28d9", "#b91c1c", "#166534"];
    const courseColorIdx = (id) => (id % COURSE_COLORS.length);

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* ─── Page Header ─── */}
            <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 32, color: "#1e293b", letterSpacing: "-0.03em" }}>
                        Guruhlar
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            bgcolor: "#7c3aed",
                            textTransform: "none",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.3)",
                            px: 3, py: 1, fontSize: 14, fontWeight: 700,
                            "&:hover": { bgcolor: "#6d28d9", boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.4)" },
                        }}
                    >
                        Guruh qo'shish
                    </Button>
                </Box>
            </Box>

            {/* ─── Stats Cards ─── */}
            <Box sx={{ px: 3, py: 2.5, display: "flex", gap: 2.5, borderBottom: "1px solid #f1f5f9" }}>
                {[
                    { icon: <GroupsIcon sx={{ color: "#7c3aed", fontSize: 20 }} />, label: "Jami guruhlar", value: totalGroups },
                    { icon: <PersonIcon sx={{ color: "#7c3aed", fontSize: 20 }} />, label: "O'qituvchilar", value: uniqueTeacher },
                    { icon: <SchoolIcon sx={{ color: "#7c3aed", fontSize: 20 }} />, label: "O'quvchilar", value: totalStudents / 2 },
                ].map((card) => (
                    <Box key={card.label} sx={{
                        flex: 1, border: "1px solid #e2e8f0", borderRadius: "12px",
                        p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    }}>
                        <Box>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: "10px", bgcolor: "#f5f3ff",
                                display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5
                            }}>
                                {card.icon}
                            </Box>
                            <Typography sx={{ fontSize: 12.5, color: "#64748b", mb: 0.5 }}>{card.label}</Typography>
                            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>
                                {card.value}
                            </Typography>
                        </Box>
                        <IconButton size="small" sx={{ color: "#94a3b8" }}>
                            <MoreHorizIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            {/* ─── Tab Bar ─── */}
            <Box sx={{ px: 3, display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0" }}>
                {[
                    { key: "guruhlar", label: "Guruhlar" },
                    { key: "arxiv", label: "Arxiv" },
                ].map((t) => (
                    <Box
                        key={t.key}
                        onClick={() => { setTab(t.key); setPage(1); setSelected([]); }}
                        sx={{
                            px: 3, py: 2, fontSize: 14.5, fontWeight: tab === t.key ? 800 : 500,
                            color: tab === t.key ? "#7c3aed" : "#64748b",
                            borderBottom: tab === t.key ? "3px solid #7c3aed" : "3px solid transparent",
                            cursor: "pointer", transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: 1,
                            "&:hover": { color: "#7c3aed" },
                        }}
                    >
                        {t.key === "arxiv" && (
                            <Box component="span" sx={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                bgcolor: "#f1f5f9", color: "#64748b", borderRadius: "50%",
                                width: 18, height: 18, fontSize: 10, fontWeight: 700,
                            }}>
                                ☰
                            </Box>
                        )}
                        {t.label}
                    </Box>
                ))}
            </Box>

            {/* ─── Filters Row ─── */}
            <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        sx={{
                            borderColor: "#e2e8f0", color: "#475569", textTransform: "none",
                            borderRadius: "8px", fontSize: 13, fontWeight: 500, px: 1.5,
                            "&:hover": { bgcolor: "#f8fafc" },
                        }}
                    >
                        Filters
                    </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Box sx={{
                        display: "flex", alignItems: "center", bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0", borderRadius: "8px",
                        px: 1.5, py: 0.5, gap: 1, width: 220,
                    }}>
                        <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        <InputBase
                            placeholder="Guruh nomi yoki kurs..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            sx={{ fontSize: 13, color: "#1e293b", flex: 1 }}
                        />
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => { fetchGroups(); fetchArxiv(); }}
                        sx={{ border: "1px solid #e2e8f0", borderRadius: "8px", color: "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}
                    >
                        <ReplayIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* ─── Bulk Action Bar ─── */}
            {selected.length > 0 && (
                <Box sx={{ px: 3, py: 1, display: "flex", gap: 1.5, bgcolor: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                        sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 12, px: 1.5, py: 0.5 }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DeleteIcon sx={{ fontSize: 15 }} />}
                        sx={{ borderColor: "#fca5a5", color: "#ef4444", textTransform: "none", borderRadius: "8px", fontSize: 12, px: 1.5, py: 0.5, "&:hover": { bgcolor: "#fef2f2" } }}
                    >
                        Delete ({selected.length})
                    </Button>
                </Box>
            )}

            {/* ─── Table ─── */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "#7c3aed" }} />
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#fafafa" }}>
                                <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                    <Checkbox
                                        size="small"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        sx={{ "&.Mui-checked": { color: "#7c3aed" } }}
                                    />
                                </TableCell>
                                {["Status", "Guruh", "Kurs", "Davomiyligi", "Dars vaqti", "Kim qo'shgan", "Xona", "O'qituvchi", "Talabalar", ""].map((h) => (
                                    <TableCell key={h} sx={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", py: 1.5, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
                                        {searchQuery ? "Qidiruv bo'yicha natija topilmadi." : "Hozircha guruhlar yo'q. Yangi guruh qo'shing!"}
                                    </TableCell>
                                </TableRow>
                            ) : pageData.map((group) => {
                                const course = group.courses;
                                const room = group.rooms;
                                const teacher = group.teacher;          // TeacherGroups dan ajratib olingan TEACHER
                                const createdBy = group.createdBy;     // request user (kim qo'shgan)
                                const stuCnt = group.studentGroups?.length || 0;
                                const ci = courseColorIdx(group.course_id || 0);

                                return (
                                    <TableRow
                                        key={group.id}
                                        hover
                                        onClick={() => onGroupClick && onGroupClick(group)}
                                        selected={selected.includes(group.id)}
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "#fafaff" },
                                            "&.Mui-selected": { bgcolor: "#f5f3ff" },
                                            "&.Mui-selected:hover": { bgcolor: "#f0ebff" },
                                        }}
                                    >
                                        <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                            <Checkbox
                                                size="small"
                                                checked={selected.includes(group.id)}
                                                onChange={(e) => { e.stopPropagation(); toggleOne(group.id); }}
                                                sx={{ "&.Mui-checked": { color: "#7c3aed" } }}
                                            />
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell sx={{ py: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <Switch
                                                    size="small"
                                                    checked={group.status === "active"}
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{
                                                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#7c3aed" },
                                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#7c3aed" },
                                                    }}
                                                />
                                                <Chip
                                                    label={group.status === "active" ? "ACTIVE" : group.status?.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        fontSize: 10, fontWeight: 700, height: 20,
                                                        bgcolor: group.status === "active" ? "#dcfce7" : "#f1f5f9",
                                                        color: group.status === "active" ? "#16a34a" : "#64748b",
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>

                                        {/* Guruh nomi */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                                                {group.name}
                                            </Typography>
                                        </TableCell>

                                        {/* Kurs */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            {course ? (
                                                <Chip
                                                    label={course.name}
                                                    size="small"
                                                    sx={{
                                                        fontSize: 11, fontWeight: 600, height: 22,
                                                        bgcolor: COURSE_COLORS[ci], color: COURSE_TEXT[ci],
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            ) : "—"}
                                        </TableCell>

                                        {/* Davomiyligi */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 12, color: "#1e293b" }}>
                                                {course ? `${course.duration_hours} soat` : "—"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                                                {group.start_date} - {group.end_date || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Dars vaqti */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                                                {group.start_time}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                                                {formatWeekDays(group.week_day)}
                                            </Typography>
                                        </TableCell>

                                        {/* Kim qo'shgan (createdBy - request user) */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 12, color: "#1e293b", fontWeight: 600 }}>
                                                {createdBy ? `${createdBy.first_name}${createdBy.role ? ` (${createdBy.role})` : ''}` : "—"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                                                {group.created_at
                                                    ? new Date(group.created_at).toLocaleDateString("uz-UZ") + " " +
                                                    new Date(group.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
                                                    : "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Xona */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 13, color: "#1e293b" }}>
                                                {room?.name || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* O'qituvchi */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            {teacher ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 11 }}>
                                                        {teacher.first_name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: 12, color: "#1e293b" }}>
                                                        {teacher.first_name}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>O'qituvchi yo'q</Typography>
                                            )}
                                        </TableCell>

                                        {/* Talabalar */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                                                {stuCnt}
                                            </Typography>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: "flex", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openDeleteDialog(group)}
                                                    sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
                                                    title="O'chirish / Arxivga o'tkazish"
                                                >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openEditDrawer(group)}
                                                    sx={{ color: "#94a3b8", "&:hover": { color: "#f59e0b" } }}
                                                    title="Tahrirlash"
                                                >
                                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onGroupClick && onGroupClick(group)}
                                                    sx={{ color: "#94a3b8", "&:hover": { color: "#7c3aed" } }}
                                                    title="Batafsil"
                                                >
                                                    <MoreHorizIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ─── Pagination ─── */}
            <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0" }}>
                <Button
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 13 }}
                >
                    ← Previous
                </Button>
                <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, val) => setPage(val)}
                    shape="rounded"
                    size="small"
                    sx={{
                        "& .MuiPaginationItem-root": { borderRadius: "8px", fontSize: 13 },
                        "& .Mui-selected": { bgcolor: "#7c3aed !important", color: "white" },
                    }}
                />
                <Button
                    variant="outlined"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 13 }}
                >
                    Next →
                </Button>
            </Box>

            {/* ══════════ RIGHT DRAWER ══════════ */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { width: 440, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" },
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1e293b", mb: 0.3 }}>
                                Guruh qo'shish
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                                Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: "#64748b", mt: -0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Drawer Body */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Guruh nomi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Guruh nomi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth placeholder="Frontend 2024"
                            value={name} onChange={(e) => setName(e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Kurs */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Kurs <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                <MenuItem value="" disabled><em style={{ color: "#94a3b8" }}>Kursni tanlang</em></MenuItem>
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Xona */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Xona <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                <MenuItem value="" disabled><em style={{ color: "#94a3b8" }}>Xonani tanlang</em></MenuItem>
                                {rooms.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.name} (sig'imi: {r.capacity})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Dars kunlari */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 1 }}>
                            Dars kunlari <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                            {WEEK_DAYS.map((d) => (
                                <Box
                                    key={d.key}
                                    onClick={() => toggleWeekDay(d.key)}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1,
                                        p: 1, borderRadius: "8px", cursor: "pointer",
                                        border: weekDays.includes(d.key) ? "1px solid #7c3aed" : "1px solid #e2e8f0",
                                        bgcolor: weekDays.includes(d.key) ? "#f5f3ff" : "white",
                                        transition: "all 0.15s",
                                        "&:hover": { borderColor: "#a78bfa" },
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={weekDays.includes(d.key)}
                                        onChange={() => { }}
                                        sx={{ p: 0, "& .MuiSvgIcon-root": { fontSize: 18 }, "&.Mui-checked": { color: "#7c3aed" } }}
                                    />
                                    <Typography sx={{ fontSize: 13, color: weekDays.includes(d.key) ? "#7c3aed" : "#475569", fontWeight: weekDays.includes(d.key) ? 600 : 400 }}>
                                        {d.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Dars vaqti */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Dars vaqti <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth type="time"
                            value={startTime} onChange={(e) => setStartTime(e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Boshlanish sanasi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Boshlanish sanasi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth type="date"
                            value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Tugash sanasi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Tugash sanasi
                        </Typography>
                        <TextField
                            fullWidth type="date"
                            value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Max talabalar soni */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Max talabalar soni
                        </Typography>
                        <TextField
                            fullWidth type="number"
                            value={maxStudent} onChange={(e) => setMaxStudent(e.target.value)}
                            size="small" inputProps={{ min: 1, max: 20 }}
                            helperText="Maksimal 20 ta talaba"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* O'qituvchilar */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 1 }}>
                            O'qituvchilar <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                multiple
                                value={teacherIds}
                                onChange={(e) => setTeacherIds(
                                    typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value
                                )}
                                displayEmpty
                                renderValue={(sel) => {
                                    if (sel.length === 0) return <em style={{ color: "#94a3b8" }}>+ Qo'shish</em>;
                                    return teachers
                                        .filter((t) => sel.includes(String(t.id)))
                                        .map((t) => `${t.first_name} ${t.last_name}`)
                                        .join(", ");
                                }}
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                {teachers.map((t) => (
                                    <MenuItem key={t.id} value={String(t.id)}>
                                        <Checkbox checked={teacherIds.includes(String(t.id))} size="small" sx={{ "&.Mui-checked": { color: "#7c3aed" } }} />
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 11 }}>
                                                {t.first_name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontSize: 13 }}>{t.first_name} {t.last_name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Studentlar */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 1 }}>
                            Studentlar
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                multiple
                                value={studentIds}
                                onChange={(e) => setStudentIds(
                                    typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value
                                )}
                                displayEmpty
                                renderValue={(sel) => {
                                    if (sel.length === 0) return <em style={{ color: "#94a3b8" }}>+ Qo'shish</em>;
                                    return students
                                        .filter((s) => sel.includes(String(s.id)))
                                        .map((s) => `${s.first_name} ${s.last_name}`)
                                        .join(", ");
                                }}
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                {students.map((s) => (
                                    <MenuItem key={s.id} value={String(s.id)}>
                                        <Checkbox checked={studentIds.includes(String(s.id))} size="small" sx={{ "&.Mui-checked": { color: "#7c3aed" } }} />
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#dcfce7", color: "#16a34a", fontSize: 11 }}>
                                                {s.first_name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontSize: 13 }}>{s.first_name} {s.last_name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                        onClick={addGroup}
                        disabled={saving || !name || !courseId || !roomId || !startDate || weekDays.length === 0 || teacherIds.length === 0}
                        sx={{
                            bgcolor: "#7c3aed", color: "white", textTransform: "none",
                            borderRadius: "8px", px: 3, py: 1, fontWeight: 600, fontSize: 13,
                            boxShadow: "none", "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" },
                        }}
                    >
                        {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </Box>
            </Drawer>

            {/* ══════════ EDIT DRAWER (PATCH /groups/:id) ══════════ */}
            <Drawer
                anchor="right"
                open={editDrawerOpen}
                onClose={closeEditDrawer}
                PaperProps={{
                    sx: { width: 440, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" },
                }}
            >
                <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1e293b", mb: 0.3 }}>
                                Guruhni tahrirlash
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                                {editingGroup?.name} - ma'lumotlarini o'zgartirish
                            </Typography>
                        </Box>
                        <IconButton onClick={closeEditDrawer} size="small" sx={{ color: "#64748b", mt: -0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {/* Guruh nomi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Guruh nomi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            value={editingGroup?.name || ""}
                            onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Izoh
                        </Typography>
                        <TextField
                            fullWidth multiline rows={2}
                            value={editingGroup?.description || ""}
                            onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Kurs */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Kurs <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={editingGroup?.course_id || ""}
                                onChange={(e) => setEditingGroup({ ...editingGroup, course_id: e.target.value })}
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Xona */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Xona <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={editingGroup?.room_id || ""}
                                onChange={(e) => setEditingGroup({ ...editingGroup, room_id: e.target.value })}
                                sx={{ borderRadius: "8px", fontSize: 14 }}
                            >
                                {rooms.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.name} (sig'imi: {r.capacity})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Dars kunlari */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 1 }}>
                            Dars kunlari <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                            {WEEK_DAYS.map((d) => {
                                const selectedDays = Array.isArray(editingGroup?.week_day) ? editingGroup.week_day : [editingGroup?.week_day].filter(Boolean);
                                const isOn = selectedDays.includes(d.key);
                                return (
                                    <Box
                                        key={d.key}
                                        onClick={() => toggleEditWeekDay(d.key)}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1,
                                            p: 1, borderRadius: "8px", cursor: "pointer",
                                            border: isOn ? "1px solid #7c3aed" : "1px solid #e2e8f0",
                                            bgcolor: isOn ? "#f5f3ff" : "white",
                                            transition: "all 0.15s",
                                            "&:hover": { borderColor: "#a78bfa" },
                                        }}
                                    >
                                        <Checkbox size="small" checked={isOn} onChange={() => { }} sx={{ p: 0, "& .MuiSvgIcon-root": { fontSize: 18 }, "&.Mui-checked": { color: "#7c3aed" } }} />
                                        <Typography sx={{ fontSize: 13, color: isOn ? "#7c3aed" : "#475569", fontWeight: isOn ? 600 : 400 }}>
                                            {d.label}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Dars vaqti */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Dars vaqti <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth type="time"
                            value={editingGroup?.start_time || "09:00"}
                            onChange={(e) => setEditingGroup({ ...editingGroup, start_time: e.target.value })}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Boshlanish sanasi */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Boshlanish sanasi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth type="date"
                            value={editingGroup?.start_date || ""}
                            onChange={(e) => setEditingGroup({ ...editingGroup, start_date: e.target.value })}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Max talabalar soni */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Max talabalar soni
                        </Typography>
                        <TextField
                            fullWidth type="number"
                            value={editingGroup?.max_student || 20}
                            onChange={(e) => setEditingGroup({ ...editingGroup, max_student: e.target.value })}
                            size="small" inputProps={{ min: 1, max: 20 }}
                            helperText="Maksimal 20 ta talaba"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>
                </Box>

                <Box sx={{ p: 3, pt: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1.5, bgcolor: "white" }}>
                    <Button
                        variant="outlined"
                        onClick={closeEditDrawer}
                        sx={{ borderColor: "#e2e8f0", color: "#1e293b", textTransform: "none", borderRadius: "8px", px: 3, py: 1, fontWeight: 500, fontSize: 13 }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={updateGroup}
                        disabled={updating}
                        sx={{
                            bgcolor: "#f59e0b", color: "white", textTransform: "none",
                            borderRadius: "8px", px: 3, py: 1, fontWeight: 600, fontSize: 13,
                            boxShadow: "none", "&:hover": { bgcolor: "#d97706", boxShadow: "none" },
                        }}
                    >
                        {updating ? "Saqlanmoqda..." : "Yangilash"}
                    </Button>
                </Box>
            </Drawer>

            {/* ══════════ DELETE CONFIRMATION DIALOG ══════════ */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                PaperProps={{ sx: { borderRadius: "12px", minWidth: 400 } }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <DeleteIcon sx={{ color: "#ef4444", fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
                            Guruhni o'chirish
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.3 }}>
                            Bu amalni qaytarib bo'lmaydi
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: 14, color: "#475569" }}>
                        <b>"{deletingGroup?.name}"</b> guruhini arxivga o'tkazmoqchimisiz?
                        Guruh "Arxiv" tabida saqlanib qoladi va qaytarib bo'lmaydi.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button
                        onClick={closeDeleteDialog}
                        sx={{ color: "#64748b", textTransform: "none", fontWeight: 600, fontSize: 13 }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        disabled={deleting}
                        variant="contained"
                        sx={{
                            bgcolor: "#ef4444", color: "white", textTransform: "none",
                            borderRadius: "8px", px: 3, fontWeight: 600, fontSize: 13,
                            boxShadow: "none", "&:hover": { bgcolor: "#dc2626", boxShadow: "none" },
                        }}
                    >
                        {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
