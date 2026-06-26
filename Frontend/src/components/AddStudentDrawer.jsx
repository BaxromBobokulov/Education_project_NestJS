import { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, IconButton, Drawer, TextField, Autocomplete, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { useNotify } from "./NotificationContext";

const GROUPS_API = "http://localhost:3000/groups/all"; // Guruhlar API'si

export default function AddStudentDrawer({ open, onClose, token, onStudentAdded, apiEndpoint, student }) {
    const notify = useNotify();
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Form states inside drawer
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoName, setPhotoName] = useState("");
    const [groups, setGroups] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);


    // Back-enddan guruhlarni tortib olish
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get(GROUPS_API, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGroupOptions(res.data);
            } catch (error) {
                console.error("Guruhlarni yuklashda xatolik", error);
            }
        };
        if(open) fetchGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, token]);

    useEffect(() => {
        if (open) {
            if (student) {
                setFirstName(student.first_name || "");
                setLastName(student.last_name || "");
                setPhone(student.phone || "");
                setEmail(student.email || "");
                setAddress(student.address || "");
                setGroups(student.studentGroups ? groupOptions.filter(g => student.studentGroups.some(sg => sg.groups?.id === g.id)) : []);
            } else {
                setFirstName("");
                setLastName("");
                setPhone("");
                setEmail("");
                setAddress("");
                setGroups([]);
                setPhoto(null);
                setPhotoName("");
            }
            setPassword("");
        }
    }, [open, student, groupOptions]);

    const handleClose = () => {
        onClose();
    };

    const addStudent = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("first_name", firstName);
            formData.append("last_name", lastName);
            formData.append("phone", phone);
            formData.append("email", email);
            formData.append("address", address);
            if (password) formData.append("password", password);
            formData.append("groups", JSON.stringify(groups.map(g => g.id)));
            if (photo) formData.append("photo", photo);

            if (student) {
                await axios.patch(`${apiEndpoint}/${student.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                notify("Talaba yangilandi!", "success");
            } else {
                await axios.post(apiEndpoint, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                notify("Yangi talaba qo'shildi!", "success");
            }

            await onStudentAdded();
            handleClose();
        } catch (e) {
            console.error("POST/PATCH /students:", e);
            notify(e.response?.data?.message || "Xatolik yuz berdi", "error");
        } finally {
            setSaving(false);
        }
    };

    const isFormInvalid = !firstName || !lastName || !phone || !email || (!student && !password);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
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
                    <IconButton onClick={handleClose} size="small" sx={{ color: "#64748b", mt: -0.5 }}>
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

                {/* Guruh */}
                <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.8 }}>
                        Guruh
                    </Typography>
                    <Autocomplete
                        multiple
                        options={groupOptions}
                        getOptionLabel={(option) => option.name || `Guruh ${option.id}`}
                        value={groups}
                        onChange={(e, val) => setGroups(val)}
                        size="small"
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Guruhlarni tanlang" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } }} />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip label={option.name} {...getTagProps({ index })} size="small" sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
                            ))
                        }
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
                    onClick={handleClose}
                    sx={{ borderColor: "#e2e8f0", color: "#1e293b", textTransform: "none", borderRadius: "8px", px: 3, py: 1, fontWeight: 500, fontSize: 13 }}
                >
                    Bekor qilish
                </Button>
                <Button
                    variant="contained"
                    onClick={addStudent}
                    disabled={saving || isFormInvalid}
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
    );
}