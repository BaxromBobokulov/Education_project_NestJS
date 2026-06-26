import { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Drawer,
    TextField,
    Avatar,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
    Chip,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uz } from 'date-fns/locale';

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LockIcon from '@mui/icons-material/Lock';

import axios from "axios";
import { useNotify } from "./NotificationContext"; // Yo'lni o'zingizga moslang

const API_BASE = "http://localhost:3000/teachers";
const GROUPS_API = "http://localhost:3000/groups/all"; // Guruhlar API'si
const GROUPS_POST_API = "http://localhost:3000/teacher-group" //Guruhga oqituvchi qoshish API' si

export default function TeacherDrawer({ open, onClose, teacher, onSuccess }) {
    const notify = useNotify();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [groupOptions, setGroupOptions] = useState([]);
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    // Form State
    const [fio, setFio] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [birthDate, setBirthDate] = useState(null);
    const [groups, setGroups] = useState([]);
    const [gender, setGender] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoName, setPhotoName] = useState("");

    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    // Back-enddan guruhlarni tortib olish
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get(GROUPS_API, { headers });
                setGroupOptions(res.data);
            } catch (error) {
                console.error("Guruhlarni yuklashda xatolik", error);
            }
        };
        fetchGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (open) {
            if (teacher) {
                setFio(`${teacher.first_name || ""} ${teacher.last_name || ""}`.trim());
                setPhone(teacher.phone || "");
                setEmail(teacher.email || "");
                setAddress(teacher.address || "");
                setBirthDate(teacher.birth_date ? new Date(teacher.birth_date) : null);
                // Backenddan kelgan teacher.groups dagi ID'larni haqiqiy obyektlarga map qilish
                setGroups(teacher.groups ? groupOptions.filter(g => teacher.groups.some(tg => tg.id === g.id)) : []);
                setGender(teacher.gender || "");
            } else {
                setFio(""); setPhone(""); setEmail(""); setBirthDate(null);
                setGroups([]); setGender(""); setPhoto(null); setPhotoName("");
            }
            setPassword("");
            setConfirmPassword("");
            setShowPasswordFields(false);
        }
    }, [open, teacher, groupOptions]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (showPasswordFields && password !== confirmPassword) {
                notify("Parollar mos kelmadi", "error");
                setLoading(false); return;
            }

            const formData = new FormData();
            const [firstName, ...lastNameArr] = fio.trim().split(" ");

            formData.append("first_name", firstName || "");
            formData.append("last_name", lastNameArr.join(" ") || "");
            formData.append("phone", phone);
            formData.append("email", email);
            formData.append("address", address);
            formData.append("groups", JSON.stringify(groups.map(g => g.id)));

            if (showPasswordFields && password) formData.append("password", password);
            if (photo) formData.append("photo", photo); 

            if (teacher) {
                await axios.patch(`${API_BASE}/${teacher.id}`, formData, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
                notify("O'qituvchi yangilandi!", "success");
            } else {
                await axios.post(API_BASE, formData, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
                notify("Yangi o'qituvchi qo'shildi!", "success");
            }

            await onSuccess();
            onClose();
        } catch (e) {
            notify(e.response?.data?.message || "Xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    const CustomLabel = ({ children }) => (
        <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500, mb: 0.5 }}>{children}</Typography>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 450, boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" } }}
        >
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uz}>
                {/* Header */}
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#1e293b", mb: 0.5 }}>
                            O'qituvchi qo'shish
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                            Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>

                {/* Body */}
                <Box sx={{ flex: 1, px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto" }}>

                    <Box>
                        <CustomLabel>Telefon raqam</CustomLabel>
                        <TextField fullWidth placeholder="+998" value={phone} onChange={e => setPhone(e.target.value)} size="small" />
                    </Box>

                    <Box>
                        <CustomLabel>Mail</CustomLabel>
                        <TextField fullWidth placeholder="Elektron pochtani kiriting" value={email} onChange={e => setEmail(e.target.value)} size="small" InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} /> }} />
                    </Box>

                    <Box>
                        <CustomLabel>O'qituvchi FIO</CustomLabel>
                        <TextField fullWidth placeholder="Ma'lumotni kiriting" value={fio} onChange={e => setFio(e.target.value)} size="small" />
                    </Box>

                    <Box>
                        <CustomLabel>Manzil</CustomLabel>
                        <TextField fullWidth placeholder="Manzilingizni kiriting" value={address} onChange={e => setAddress(e.target.value)} size="small" InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} /> }} />
                    </Box>

                    <Box>
                        <CustomLabel>Tug'ilgan sanasi</CustomLabel>
                        <DatePicker
                            value={birthDate}
                            onChange={(newValue) => setBirthDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                            InputProps={{ startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} /> }}
                        />
                    </Box>

                    <Box>
                        <CustomLabel>Guruh</CustomLabel>
                        <Autocomplete
                            multiple
                            options={groupOptions}
                            getOptionLabel={(option) => option.name || option.label || `Guruh ${option.id}`}
                            value={groups}
                            onChange={(e, val) => setGroups(val)}
                            size="small"
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Guruhlarni tanlang" InputProps={{ ...params.InputProps, startAdornment: <SearchIcon sx={{ ml: 1, color: '#94a3b8', fontSize: 18 }} /> }} />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option.name || option.label} {...getTagProps({ index })} size="small" sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px" }} deleteIcon={<CancelOutlinedIcon style={{ color: '#94a3b8', fontSize: 16 }} />} />
                                ))
                            }
                        />
                    </Box>

                    <Box>
                        <CustomLabel>Jinsi</CustomLabel>
                        <FormControl component="fieldset">
                            <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)}>
                                <FormControlLabel value="male" control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#7c3aed' } }} />} label={<Typography sx={{ fontSize: 13, color: '#475569' }}>Erkak</Typography>} />
                                <FormControlLabel value="female" control={<Radio size="small" sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#7c3aed' } }} />} label={<Typography sx={{ fontSize: 13, color: '#475569' }}>Ayol</Typography>} />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box>
                        <CustomLabel>Surati</CustomLabel>
                        <Box sx={{ border: "2px dashed #e2e8f0", borderRadius: "10px", bgcolor: "#ffffff", p: 4, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "0.2s", "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" } }} onClick={() => fileInputRef.current.click()}>
                            <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files[0]) { setPhoto(e.target.files[0]); setPhotoName(e.target.files[0].name); } }} style={{ display: "none" }} accept="image/*" />
                            {photo ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Avatar src={URL.createObjectURL(photo)} sx={{ width: 64, height: 64, border: '1px solid #e2e8f0' }} />
                                    <Typography sx={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{photoName}</Typography>
                                </Box>
                            ) : (
                                <>
                                    <CloudUploadIcon sx={{ fontSize: 28, color: "#1e293b", mb: 1 }} />
                                    <Typography sx={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
                                        Click to upload <span style={{ color: '#64748b', fontWeight: 400 }}>or drag and drop</span>
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5 }}>
                                        JPG or PNG (max. 800x800px)
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {!showPasswordFields && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                                <Typography onClick={() => setShowPasswordFields(true)} sx={{ color: '#7c3aed', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    + Parol qo'shish
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {showPasswordFields && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc', p: 2, borderRadius: '8px', mt: -1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Parol</Typography>
                                <IconButton size="small" onClick={() => { setShowPasswordFields(false); setPassword(""); setConfirmPassword(""); }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                            </Box>
                            <TextField type="password" placeholder="Yangi parolni kiriting" fullWidth value={password} onChange={e => setPassword(e.target.value)} size="small" InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} /> }} />
                            <TextField type="password" placeholder="Parolni qayta kiriting" fullWidth value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} size="small" InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} /> }} />
                        </Box>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ p: 2, borderTop: "1px solid #f1f5f9", display: "flex", gap: 1.5, justifyContent: 'flex-end', bgcolor: '#ffffff' }}>
                    <Button variant="outlined" onClick={onClose} sx={{ borderRadius: "8px", fontWeight: 600, textTransform: 'none', color: '#475569', borderColor: '#e2e8f0', px: 3 }}>
                        Bekor qilish
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ bgcolor: "#f1f5f9", color: "#94a3b8", borderRadius: "8px", fontWeight: 600, textTransform: 'none', px: 4, boxShadow: 'none', "&:hover": { bgcolor: "#7c3aed", color: "#fff" } }}>
                        {loading ? "..." : "Saqlash"}
                    </Button>
                </Box>
            </LocalizationProvider>
        </Drawer>
    );
}