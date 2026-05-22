import { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Drawer,
    TextField,
    InputBase,
    Avatar,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";

const GET_API  = "http://localhost:3000/students/all";
const POST_API = "http://localhost:3000/students";

export default function Talabalar() {
    const [drawerOpen,  setDrawerOpen]  = useState(false);
    const [selected,    setSelected]    = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page,        setPage]        = useState(1);
    const [students,    setStudents]    = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [firstName,  setFirstName]  = useState("");
    const [lastName,   setLastName]   = useState("");
    const [phone,      setPhone]      = useState("");
    const [email,      setEmail]      = useState("");
    const [address,    setAddress]    = useState("");
    const [password,   setPassword]   = useState("");
    const [photo,      setPhoto]      = useState(null);
    const [photoName,  setPhotoName]  = useState("");

    const token = localStorage.getItem("token");

    // ── GET students ──
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(GET_API, {
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

    // ── POST student ──
    const addStudent = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("first_name", firstName);
            formData.append("last_name",  lastName);
            formData.append("phone",      phone);
            formData.append("email",      email);
            formData.append("address",    address);
            formData.append("password",   password);
            if (photo) formData.append("photo", photo);

            await axios.post(POST_API, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            // reset form
            setFirstName(""); setLastName(""); setPhone("");
            setEmail("");     setAddress("");   setPassword("");
            setPhoto(null);   setPhotoName("");
            setDrawerOpen(false);
            await fetchStudents();
        } catch (e) {
            console.error("POST /students:", e);
        } finally {
            setSaving(false);
        }
    };

    const allSelected = selected.length === students.length && students.length > 0;
    const toggleAll   = () => setSelected(allSelected ? [] : students.map((s) => s.id));
    const toggleOne   = (id) => setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    // search filter
    const filtered = students.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            (s.phone  || "").includes(q) ||
            (s.email  || "").toLowerCase().includes(q)
        );
    });

    const PER_PAGE = 10;
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* ─── Page Header ─── */}
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
                            onClick={() => setDrawerOpen(true)}
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
                        startIcon={<DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
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
                                {["Nomi", "Telefon", "Email", "Manzil", "Status", "Yaratilgan", ""].map((h) => (
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
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 600 }}>
                                                {student.first_name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                                                {student.first_name} {student.last_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#1e293b", py: 1.5, whiteSpace: "nowrap" }}>
                                        {student.phone}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5 }}>
                                        {student.email}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: "#64748b", py: 1.5 }}>
                                        {student.address}
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
                                            <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#7c3aed" } }}>
                                                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}>
                                                <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#f59e0b" } }}>
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

            {/* ─── RIGHT DRAWER ─── */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { width: 420, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" },
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1e293b", mb: 0.3 }}>
                                Talaba qo'shish
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
                                Bu yerda siz yangi talaba qo'shishingiz mumkin.
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: "#64748b", mt: -0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Drawer Body */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Ism */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Ism <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth placeholder="Ismi" value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Familiya */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Familiya <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth placeholder="Familiyasi" value={lastName}
                            onChange={(e) => setLastName(e.target.value)} size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Telefon */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Telefon raqam <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth placeholder="941234512" value={phone}
                            onChange={(e) => setPhone(e.target.value)} size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Email */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Email <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth placeholder="student@gmail.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Manzil */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Manzil
                        </Typography>
                        <TextField
                            fullWidth placeholder="Manzilini kiriting" value={address}
                            onChange={(e) => setAddress(e.target.value)} size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Parol */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Parol <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth type="password" placeholder="Parolni kiriting"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }}
                        />
                    </Box>

                    {/* Photo */}
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Surati (rasm)
                        </Typography>
                        <input
                            ref={fileInputRef} type="file" accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) { setPhoto(file); setPhotoName(file.name); }
                            }}
                        />
                        <Box
                            onClick={() => fileInputRef.current.click()}
                            sx={{
                                border: "2px dashed #e2e8f0", borderRadius: "10px", p: 3,
                                textAlign: "center", cursor: "pointer",
                                "&:hover": { borderColor: "#a78bfa", bgcolor: "#faf5ff" },
                                transition: "all 0.2s",
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 32, color: "#94a3b8", mb: 1 }} />
                            <Typography sx={{ fontSize: 13, color: "#475569" }}>
                                <span style={{ color: "#7c3aed", fontWeight: 600 }}>Click to upload</span> or drag and drop
                            </Typography>
                            {photoName
                                ? <Typography sx={{ fontSize: 12, color: "#7c3aed", mt: 0.5, fontWeight: 500 }}>{photoName}</Typography>
                                : <Typography sx={{ fontSize: 11.5, color: "#94a3b8", mt: 0.3 }}>JPG or PNG (max. 2 mb)</Typography>
                            }
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
                        onClick={addStudent}
                        disabled={saving || !firstName || !lastName || !phone || !email || !password}
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
        </Box>
    );
}
