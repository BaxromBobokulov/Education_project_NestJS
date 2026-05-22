import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Drawer,
    TextField,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";

const API = "http://localhost:3000/rooms/all";
const Post_API = "http://localhost:3000/rooms/add";

const BRANCHES = [
    "AiCoder markazi",
    "Fizika va Matematika",
    "4-maktab",
    "Niner markazi",
    "IELTS full mock",
    "IELTS full mock centre",
    "Arxiv",
];

export default function Xonalar() {
    const [addDrawerOpen,  setAddDrawerOpen]  = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedRoom,   setSelectedRoom]   = useState(null);
    const [name,           setName]           = useState("");
    const [capacity,       setCapacity]       = useState("");
    const [editName,       setEditName]       = useState("");
    const [editCapacity,   setEditCapacity]   = useState("");
    const [rooms,          setRooms]          = useState([]);

    const getRooms = async () => {
        try {
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setRooms(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => { getRooms(); }, []);

    const addRoom = async () => {
        try {
            await axios.post(Post_API, { name, capacity: parseInt(capacity) }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            await getRooms();
            setAddDrawerOpen(false);
            setName("");
            setCapacity("");
        } catch (error) {
            console.log(error);
        }
    };

    const deleteRoom = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/rooms/delete/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            await getRooms();
        } catch (error) {
            console.log(error);
        }
    };

    // Edit drawer ochish — xonaning mavjud ma'lumotlari bilan
    const openEditDrawer = (room) => {
        setSelectedRoom(room);
        setEditName(room.name);
        setEditCapacity(String(room.capacity));
        setEditDrawerOpen(true);
    };

    const editRoom = async () => {
        if (!selectedRoom) return;
        try {
            await axios.put(
                `http://localhost:3000/rooms/update/${selectedRoom.id}`,
                { name: editName, capacity: parseInt(editCapacity) },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            await getRooms();
            setEditDrawerOpen(false);
            setSelectedRoom(null);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* ── Header row ── */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2.5, pb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: 17 }}>Xonalar</Typography>
                    <IconButton size="small" onClick={getRooms}>
                        <RefreshIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                    </IconButton>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDrawerOpen(true)}
                    sx={{
                        bgcolor: "#a855f7",
                        textTransform: "none",
                        borderRadius: "8px",
                        boxShadow: "none",
                        px: 2,
                        py: 0.8,
                        fontSize: 13,
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#9333ea", boxShadow: "none" },
                    }}
                >
                    Xonani qo'shish
                </Button>
            </Box>
            {/* ── Room cards — 4 per row ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 0,
                    px: 2,
                    pb: 2,
                    "@media (max-width:1100px)": { gridTemplateColumns: "repeat(3, 1fr)" },
                    "@media (max-width:750px)": { gridTemplateColumns: "repeat(2, 1fr)" },
                    "@media (max-width:480px)": { gridTemplateColumns: "1fr" },
                }}
            >
                {rooms.map((room) => (
                    <Card
                        key={room.id}
                        sx={{
                            boxShadow: "none",
                            bgcolor: "#f1f5f9",
                            borderRadius: 0,
                            borderBottom: "1px solid #f1f5f9",
                            borderRight: "1px solid #f1f5f9",
                            borderRadius: "8px",
                            mr: 2,
                            mb: 2,
                        }}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                px: 2,
                                py: "14px !important",
                                gap: 1,
                                "&:hover": { bgcolor: "#f1f5f9" },
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 16,
                                        color: "#1e293b",
                                        mb: 0.3,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {room.name}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                                    Sig'imi: {room.capacity}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                <IconButton
                                    onClick={() => deleteRoom(room.id)}
                                    size="small"
                                    sx={{
                                        color: "#ef4444",
                                        width: 28,
                                        height: 28,
                                        "&:hover": { color: "#ef4444" },
                                    }}
                                >
                                    <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                    onClick={() => openEditDrawer(room)}
                                    size="small"
                                    sx={{
                                        color: "#3b82f6",
                                        width: 28,
                                        height: 28,
                                        "&:hover": { color: "#2563eb" },
                                    }}
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* ── Right Drawer — Xona qo'shish ── */}
            <Drawer
                anchor="right"
                open={addDrawerOpen}
                onClose={() => setAddDrawerOpen(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: 380,
                        px: 3,
                        py: 3,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "10px 0 0 10px",
                        boxSizing: "border-box",
                    },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#1e293b" }}>
                        Xonani qo'shish
                    </Typography>
                    <IconButton onClick={() => setAddDrawerOpen(false)} size="small" sx={{ color: "#64748b" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, flex: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Nomi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Xona nomi"
                            size="small"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    fontSize: 14,
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                },
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Sig'imi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Masalan: 20"
                            size="small"
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    fontSize: 14,
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4, pt: 2, borderTop: "1px solid #e2e8f0" }}>
                    <Button
                        variant="outlined"
                        onClick={() => setAddDrawerOpen(false)}
                        sx={{
                            borderColor: "#e2e8f0",
                            color: "#64748b",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            fontWeight: 500,
                            fontSize: 13,
                        }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={addRoom}
                        sx={{
                            bgcolor: "#a855f7",
                            color: "white",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            fontWeight: 500,
                            fontSize: 13,
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#9333ea", boxShadow: "none" },
                        }}
                    >
                        Saqlash
                    </Button>
                </Box>
            </Drawer>

            {/* ── Right Drawer — Xonani tahrirlash ── */}
            <Drawer
                anchor="right"
                open={editDrawerOpen}
                onClose={() => setEditDrawerOpen(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: 380,
                        px: 3,
                        py: 3,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "10px 0 0 10px",
                        boxSizing: "border-box",
                    },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#1e293b" }}>
                        Xonani tahrirlash
                    </Typography>
                    <IconButton onClick={() => setEditDrawerOpen(false)} size="small" sx={{ color: "#64748b" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, flex: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Nomi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Xona nomi"
                            size="small"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    fontSize: 14,
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                },
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                            Sig'imi <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Masalan: 20"
                            size="small"
                            type="number"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    fontSize: 14,
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4, pt: 2, borderTop: "1px solid #e2e8f0" }}>
                    <Button
                        variant="outlined"
                        onClick={() => setEditDrawerOpen(false)}
                        sx={{
                            borderColor: "#e2e8f0",
                            color: "#64748b",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            fontWeight: 500,
                            fontSize: 13,
                        }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={editRoom}
                        sx={{
                            bgcolor: "#3b82f6",
                            color: "white",
                            textTransform: "none",
                            borderRadius: "8px",
                            px: 3,
                            fontWeight: 500,
                            fontSize: 13,
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
                        }}
                    >
                        Saqlash
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}
