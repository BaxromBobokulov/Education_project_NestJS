import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Slider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
  Chip
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import MicIcon from "@mui/icons-material/Mic";
import InfoIcon from "@mui/icons-material/Info";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import axios from "axios";
import { useNotify } from "../components/NotificationContext";

const BASE = "http://localhost:3000";

const STATUS_LABEL = {
  PENDING:    { label: "Kutayabti",     color: "#EAB308", border: "#FDE047", bg: "#FEFCE8" },
  CHECKED:    { label: "Qabul qilindi", color: "#166534", border: "#bbf7d0", bg: "#dcfce7" },
  INCOMPLETE: { label: "Qaytarildi",    color: "#991b1b", border: "#fecaca", bg: "#fee2e2" },
};

const uzMonths = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const formatUzbekDate = (dateString) => {
  if (!dateString) return "—";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "—";
  const day = dateObj.getDate();
  const month = uzMonths[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${year} ${hours}:${minutes}`;
};

const getFilesList = (fileStr) => {
  if (!fileStr) return [];
  return fileStr.split(',').map(f => f.trim()).filter(Boolean);
};

export default function HomeworkReview({ answerId, studentName, homework, onBack }) {
  const [score, setScore] = useState(60);
  const [comment, setComment] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch answer if answerId exists
  useEffect(() => {
    if (!answerId) return;
    const fetchAnswer = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/homework/answer/${answerId}`, { headers });
        setAnswer(res.data);
        const lastResult = res.data?.homeworkResults?.[0];
        if (lastResult?.score !== undefined) setScore(lastResult.score);
        if (lastResult?.title !== undefined) setComment(lastResult.title);
      } catch (e) {
        console.error("GET /homework/answer/:id error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswer();
  }, [answerId]);

  const handleGrade = async () => {
    if (!answerId) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${BASE}/homework/answer/${answerId}/grade`,
        { score, title: comment || `Ball: ${score}` },
        { headers }
      );
      notify("Vazifa muvaffaqiyatli tekshirildi", "success");
      onBack();
    } catch (e) {
      console.error("POST /grade error:", e);
      notify(e?.response?.data?.message || "Xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreChange = (event, newValue) => {
    setScore(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  const studentUser = answer?.user;
  const studentFiles = getFilesList(answer?.file);
  const hwFile = answer?.homework?.file || homework?.file;

  return (
    <Box sx={{ maxWidth: 800, p: 3, fontFamily: "sans-serif" }}>
      {/* Breadcrumb qismi */}
      <Typography sx={{ fontSize: 16, mb: 3, fontWeight: 500 }}>
        <span onClick={onBack} style={{ color: "#111827", fontWeight: 600, cursor: "pointer" }}>Kutayotganlar</span>
        <span style={{ color: "#9CA3AF", margin: "0 8px" }}>&gt;</span>
        <span style={{ color: "#6B7280" }}>Uyga vazifa</span>
      </Typography>

      {/* 1. Uy vazifasi bloki */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #F3F4F6",
          borderRadius: 2,
          bgcolor: "#FDFDFD",
        }}
      >
        <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: 18, mb: 2 }}>
          Uy vazifasi
        </Typography>
        <Box sx={{ bgcolor: "#F9FAFB", p: 3, borderRadius: 2 }}>
          <Typography sx={{ color: "#9CA3AF", fontSize: 14, mb: 1 }}>Izoh:</Typography>
          <Typography sx={{ color: "#374151", fontSize: 15, lineHeight: 1.6 }}>
            {answer?.homework?.title || homework?.title || "Mavzu ko'rsatilmagan"}
          </Typography>

          {hwFile && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: "#9CA3AF", fontSize: 13, mb: 0.5 }}>Biriktirilgan dars fayli:</Typography>
              <Box 
                component="a"
                href={`${BASE}/${hwFile}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 1, 
                  color: "#1e3a8a", 
                  fontSize: 14, 
                  textDecoration: "underline", 
                  fontWeight: 500 
                }}
              >
                <InsertDriveFileIcon sx={{ fontSize: 18 }} />
                Faylni ko'rish
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 2. O'quvchi ma'lumotlari bloki */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "#F3F4F6", // Och kulrang fon
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            src={studentUser?.photo ? `${BASE}/${studentUser.photo}` : undefined}
            sx={{ width: 36, height: 36, bgcolor: "#1e3a8a", color: "#fff", fontWeight: 700 }}
          >
            {(studentUser?.first_name || studentName || "?")[0]}
          </Avatar>
          <Typography sx={{ fontWeight: 600, color: "#1E3A8A", fontSize: 18 }}>
            {studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : (studentName || "—")}
          </Typography>
        </Box>

        <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 2, mb: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Box>
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, mb: 0.5 }}>Vaqti:</Typography>
            <Typography sx={{ color: "#111827", fontWeight: 500, fontSize: 15 }}>
              {formatUzbekDate(answer?.created_at)}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, mb: 0.5 }}>Fayllar soni:</Typography>
            <Typography sx={{ color: "#111827", fontWeight: 500, fontSize: 15 }}>
              {studentFiles.length}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, mb: 0.5 }}>Status:</Typography>
            <Box
              sx={{
                border: `1px solid ${STATUS_LABEL[answer?.status]?.border || "#FDE047"}`,
                color: STATUS_LABEL[answer?.status]?.color || "#EAB308",
                px: 1.5,
                py: 0.2,
                borderRadius: 1,
                fontSize: 13,
                fontWeight: 500,
                display: "inline-block",
                bgcolor: STATUS_LABEL[answer?.status]?.bg || "#FEFCE8",
              }}
            >
              {STATUS_LABEL[answer?.status]?.label || "Kutayabti"}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            p: 2,
            borderLeft: "3px solid #2563EB", // Ko'k chiziq
          }}
        >
          <Typography sx={{ color: "#9CA3AF", fontSize: 13, mb: 1 }}>Uyga vazifa izohi:</Typography>
          <Typography sx={{ color: "#111827", fontWeight: 500 }}>
            {answer?.title || "Izoh qoldirilmagan"}
          </Typography>

          {/* Student files list if any */}
          {studentFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
              {studentFiles.map((file, idx) => {
                const fileName = file.split('/').pop() || 'file';
                const fileUrl = file.startsWith('uploads/') 
                  ? `${BASE}/lessons/video/${file.replace('uploads/', '')}`
                  : file;
                return (
                  <Box 
                    key={idx}
                    component="a"
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      p: 1.2, 
                      bgcolor: '#F9FAFB', 
                      borderRadius: 1.5, 
                      border: '1px solid #E5E7EB',
                      textDecoration: 'none',
                      color: '#111827',
                      minWidth: 200,
                      maxWidth: 280,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#1E3A8A',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <InsertDriveFileIcon sx={{ color: '#1E3A8A', fontSize: 18 }} />
                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                      {fileName}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>

      {/* 3. Baholash va Fayl yuklash bloki */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: "#F9FAFB",
          borderRadius: 2,
        }}
      >
        {/* Info Alert */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            p: 2,
            borderRadius: 2,
            mb: 4,
          }}
        >
          <InfoIcon sx={{ color: "#3B82F6" }} />
          <Typography sx={{ color: "#1D4ED8", fontSize: 14 }}>
            60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
          </Typography>
        </Box>

        {/* Baholash Slider qismi */}
        <Typography sx={{ fontWeight: 600, color: "#111827", mb: 2 }}>Ball</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1 }}>
          <Box sx={{ flex: 1, position: "relative" }}>
            <Slider
              value={score}
              onChange={handleScoreChange}
              min={0}
              max={100}
              step={10}
              marks
              sx={{
                color: score >= 60 ? "#22C55E" : "#EF4444", // Yashil yoki qizil rang
                height: 10,
                "& .MuiSlider-track": { border: "none" },
                "& .MuiSlider-rail": { bgcolor: "#E5E7EB", opacity: 1 },
                "& .MuiSlider-thumb": {
                  height: 24,
                  width: 24,
                  backgroundColor: "#fff",
                  border: "3px solid currentColor",
                  "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                    boxShadow: "inherit",
                  },
                  "&::before": { display: "none" },
                },
                "& .MuiSlider-mark": {
                  backgroundColor: "#fff",
                  height: 4,
                  width: 4,
                  borderRadius: "50%",
                },
              }}
            />
            <Typography sx={{ textAlign: "center", color: "#4B5563", fontSize: 14, mt: 0.5 }}>
              O'tish bali
            </Typography>
          </Box>
          <Box
            sx={{
              width: 50,
              height: 40,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#FFFFFF",
              fontWeight: 600,
              color: score >= 60 ? "#22C55E" : "#EF4444",
            }}
          >
            {score}
          </Box>
        </Box>

        {/* Fayllar qismi (Visual placeholder) */}
        <Typography sx={{ fontWeight: 600, color: "#111827", mt: 4, mb: 2 }}>Fayllar</Typography>
        <Box
          sx={{
            border: "2px dashed #D1D5DB",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "#FDFDFD",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F9FAFB" },
            mb: 4,
          }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: "#10B981", mb: 1 }} />
          <Typography sx={{ color: "#374151", mb: 1, fontSize: 15 }}>
            Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>
            .jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin
          </Typography>
        </Box>

        {/* Izoh yozish qismi */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Izohingiz (ixtiyoriy)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          sx={{
            bgcolor: "#FFFFFF",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              padding: "12px 16px",
            },
          }}
          InputProps={{
            endAdornment: (
              <Box sx={{ display: "flex", alignItems: "flex-end", height: "100%" }}>
                <IconButton
                  sx={{
                    bgcolor: "#10B981",
                    color: "white",
                    borderRadius: 2,
                    p: 1,
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  <MicIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
        />

        {/* Tugmalar */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              color: "#6B7280",
              borderColor: "#D1D5DB",
              textTransform: "none",
              px: 3,
              borderRadius: 2,
              fontWeight: 500,
              "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleGrade}
            disabled={submitting || !answerId}
            sx={{
              bgcolor: "#10B981",
              textTransform: "none",
              px: 4,
              borderRadius: 2,
              fontWeight: 500,
              boxShadow: "none",
              "&:hover": { bgcolor: "#059669", boxShadow: "none" },
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Yuborish"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
