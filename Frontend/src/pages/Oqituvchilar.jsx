import { useState, useEffect } from "react";
import {
    Box, Typography, Button, IconButton, InputBase, Avatar, Checkbox,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReplayIcon from "@mui/icons-material/Replay";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import axios from "axios";
import { useNotify } from "../components/NotificationContext";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import TeacherDrawer from "../components/TeacherDrawer"; // Yangi komponentni chaqirish

const API_BASE = "http://localhost:3000/teachers";

export default function Oqituvchilar() {
    const notify = useNotify();

    // Page states
    const [searchQuery, setSearchQuery] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [selected, setSelected] = useState([]);

    // Drawer states
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Delete states
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    const getTeachers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/all?_t=${new Date().getTime()}`, { headers });
            setTeachers(res.data);
        } catch (e) {
            console.error(e); 
        }
    };

    useEffect(() => { getTeachers(); }, []);

    const handleOpenDrawer = (teacher = null) => {
        setEditingTeacher(teacher);
        setDrawerOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_BASE}/${deleteId}`, { headers });
            setTeachers((prev) => prev.filter((t) => t.id !== deleteId));
            setSelected((prev) => prev.filter((id) => id !== deleteId));
            notify("O'qituvchi o'chirildi!", "success");
            await getTeachers();
        } catch (e) {
            notify("O'chirishda xatolik", "error");
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const toggleAll = () => setSelected(selected.length === teachers.length && teachers.length > 0 ? [] : teachers.map((t) => t.id));
    const toggleOne = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* Page Header */}
            <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 25, color: "#1e293b" }}>
                        O'qituvchilar
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 500 }}>
                            Export
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDrawer()} sx={{ bgcolor: "#7c3aed", textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 700, "&:hover": { bgcolor: "#6d28d9" } }}>
                            O'qituvchi qo'shish
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Filters Row */}
            <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 500 }}>Filters</Button>
                    <IconButton size="small" onClick={getTeachers} sx={{ color: "#64748b" }}><ReplayIcon sx={{ fontSize: 20 }} /></IconButton>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", px: 1.5, py: 0.5, gap: 1, width: 200 }}>
                    <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                    <InputBase placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ fontSize: 13, color: "#1e293b", flex: 1 }} />
                </Box>
            </Box>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <Box sx={{ px: 3, py: 1, bgcolor: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                    <Button variant="outlined" startIcon={<DeleteOutlinedIcon sx={{ fontSize: 15 }} />} sx={{ borderColor: "#fca5a5", color: "#ef4444", textTransform: "none", borderRadius: "8px", fontSize: 12, px: 1.5, py: 0.5 }}>
                        Delete Selected
                    </Button>
                </Box>
            )}

            {/* Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#fafafa" }}>
                            <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                <Checkbox size="small" checked={selected.length === teachers.length && teachers.length > 0} onChange={toggleAll} sx={{ "&.Mui-checked": { color: "#7c3aed" } }} />
                            </TableCell>
                            {["Nomi", "Guruh", "Telefon", "Email", "Yaratilgan sanasi", "Amallar"].map((h) => (
                                <TableCell key={h} sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", py: 1.5, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teachers.filter(t => (t.first_name + ' ' + t.last_name).toLowerCase().includes(searchQuery.toLowerCase())).map((teacher) => (
                            <TableRow key={teacher.id} hover selected={selected.includes(teacher.id)} sx={{ "&.Mui-selected": { bgcolor: "#f5f3ff" } }}>
                                <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                    <Checkbox size="small" checked={selected.includes(teacher.id)} onChange={() => toggleOne(teacher.id)} sx={{ "&.Mui-checked": { color: "#7c3aed" } }} />
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Avatar
                                            src={teacher.photo ? `http://localhost:3000/user/image/${teacher.photo}` : undefined}
                                            sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700 }}
                                        >
                                            {!teacher.photo && teacher.first_name?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{teacher.first_name} {teacher.last_name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                    {teacher.teacherGroups?.length ? (
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            {teacher.teacherGroups.map((tg, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        bgcolor: "#ffffff",
                                                        color: "#000000",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: "6px",
                                                        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {tg.groups?.name}
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                                            Guruh mavjud emas
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5 }}>{teacher.phone}</TableCell>
                                <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5 }}>{teacher.email}</TableCell>
                                <TableCell sx={{ py: 1.5 }}>{teacher.created_at.slice(0, 10)}</TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <IconButton onClick={() => handleOpenDrawer(teacher)} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}><EditOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
                                        <IconButton onClick={() => { setDeleteId(teacher.id); setConfirmOpen(true); }} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}><DeleteOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Komponent chaqiruvi */}
            <TeacherDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} teacher={editingTeacher} onSuccess={getTeachers} />
            <DeleteConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
        </Box>
    );
}