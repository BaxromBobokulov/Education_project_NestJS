import { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, InputBase, Avatar,Checkbox,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Pagination,CircularProgress,} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";

import AddStudentDrawer from "../components/AddStudentDrawer";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { useNotify } from "../components/NotificationContext";

const GET_API = "http://localhost:3000/students/all";
const POST_API = "http://localhost:3000/students";

export default function Talabalar() {
    const notify = useNotify();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [selected, setSelected] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${GET_API}?_t=${new Date().getTime()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("GET /students/all:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleOpenDrawer = (student = null) => {
        setEditingStudent(student);
        setDrawerOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/students/${deleteId}`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents((prev) => prev.filter((s) => s.id !== deleteId));
            setSelected((prev) => prev.filter((id) => id !== deleteId));
            notify("Talaba o'chirildi!", "success");
            await fetchStudents();
        } catch (e) {
            notify("O'chirishda xatolik", "error");
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const allSelected = selected.length === students.length && students.length > 0;
    const toggleAll = () => setSelected(allSelected ? [] : students.map((s) => s.id));
    const toggleOne = (id) => setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    const filtered = students.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            (s.phone || "").includes(q) ||
            (s.email || "").toLowerCase().includes(q)
        );
    });

    const PER_PAGE = 10;
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* Page Header */}
            <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 25, color: "#1e293b" }}>
                        Talabalar
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            sx={{
                                borderColor: "#e2e8f0", color: "#475569", textTransform: "none",
                                borderRadius: "8px", fontSize: 13, fontWeight: 500, px: 2,
                                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                            }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDrawer()}
                            sx={{
                                bgcolor: "#7c3aed", textTransform: "none", borderRadius: "8px",
                                boxShadow: "none", px: 2, fontSize: 13, fontWeight: 600,
                                "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" },
                            }}
                        >
                            Talaba qo'shish
                        </Button>
                    </Box>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                    Ushbu sahifada siz talabalar ro'yxatini va ularning ma'lumotlarini topasiz.
                </Typography>
            </Box>

            {/* Filters Row */}
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
                        px: 1.5, py: 0.5, gap: 1, width: 200,
                    }}>
                        <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        <InputBase
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            sx={{ fontSize: 13, color: "#1e293b", flex: 1 }}
                        />
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            borderColor: "#e2e8f0", color: "#475569", textTransform: "none",
                            borderRadius: "8px", fontSize: 12, px: 1.5, minWidth: "auto",
                            "&:hover": { bgcolor: "#f8fafc" },
                        }}
                    >
                        Arxiv
                    </Button>
                </Box>
            </Box>

            {/* Bulk Action Bar */}
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
                        startIcon={<DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ borderColor: "#fca5a5", color: "#ef4444", textTransform: "none", borderRadius: "8px", fontSize: 12, px: 1.5, py: 0.5, "&:hover": { bgcolor: "#fef2f2" } }}
                    >
                        Delete ({selected.length})
                    </Button>
                </Box>
            )}

            {/* Table */}
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
                                {["Nomi", "Guruh", "Telefon raqami", "Email", "Status", "Yaratilgan", ""].map((h) => (
                                    <TableCell key={h} sx={{ fontSize: 12, fontWeight: 600, color: "#64748b", py: 1.5, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
                                        {searchQuery ? "Qidiruv bo'yicha natija topilmadi." : "Hozircha talabalar yo'q. Yangi talaba qo'shing!"}
                                    </TableCell>
                                </TableRow>
                            ) : pageData.map((student) => (
                                <TableRow
                                    key={student.id}
                                    hover
                                    selected={selected.includes(student.id)}
                                    sx={{
                                        "&:hover": { bgcolor: "#fafaff" },
                                        "&.Mui-selected": { bgcolor: "#f5f3ff" },
                                        "&.Mui-selected:hover": { bgcolor: "#f0ebff" },
                                    }}
                                >
                                    <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                        <Checkbox
                                            size="small"
                                            checked={selected.includes(student.id)}
                                            onChange={() => toggleOne(student.id)}
                                            sx={{ "&.Mui-checked": { color: "#7c3aed" } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar
                                                src={student.photo ? `http://localhost:3000/user/image/${student.photo}` : undefined}
                                                sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700 }}
                                            >
                                                {!student.photo && student.first_name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                                                {student.first_name} {student.last_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        {student.studentGroups?.length ? (
                                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                {student.studentGroups.map((sg, idx) => (
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
                                                        {sg.groups?.name}
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                                                Guruh mavjud emas
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#1e293b", py: 1.5, whiteSpace: "nowrap" }}>
                                        {student.phone}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5 }}>
                                        {student.email}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Box sx={{
                                            display: "inline-flex", alignItems: "center", gap: 0.5,
                                            px: 1.2, py: 0.3, borderRadius: "20px",
                                            bgcolor: student.status === "active" ? "#dcfce7" : "#f1f5f9",
                                            color: student.status === "active" ? "#16a34a" : "#64748b",
                                            fontSize: 11, fontWeight: 600,
                                        }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: student.status === "active" ? "#16a34a" : "#94a3b8" }} />
                                            {student.status || "active"}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5, whiteSpace: "nowrap" }}>
                                        {student.created_at ? new Date(student.created_at).toLocaleDateString("uz-UZ") : "—"}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Box sx={{ display: "flex", gap: 0.5 }}>
                                            <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#7c3aed", bgcolor: "#f5f3ff" } }}>
                                                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                            <IconButton onClick={() => { setDeleteId(student.id); setConfirmOpen(true); }} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                                                <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenDrawer(student)} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#f59e0b", bgcolor: "#fffbeb" } }}>
                                                <EditOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
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
                    onClick={() => setPage((p) => p - 1)}
                    sx={{ borderColor: "#e2e8f0", color: "#475569", textTransform: "none", borderRadius: "8px", fontSize: 13 }}
                >
                    Next →
                </Button>
            </Box>

            {/* ALOHIDA AJRATILGAN DRAWER KOMPONENTI */}
            <AddStudentDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                token={token}
                apiEndpoint={POST_API}
                onStudentAdded={fetchStudents}
                student={editingStudent}
            />
            <DeleteConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </Box>
    );
}