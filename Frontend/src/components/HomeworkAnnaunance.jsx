import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import LinkIcon from "@mui/icons-material/Link";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNotify } from "./NotificationContext";

export default function HomeworkAnnaunance({ groupId, onBack, onSaveSuccess }) {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const notify = useNotify();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (groupId) {
      axios
        .get(`http://localhost:3000/homework/group/${groupId}/lessons`, { headers })
        .then((res) => {
          setLessons(res.data);
        })
        .catch((err) => console.error("Error fetching lessons:", err));
    }
  }, [groupId]);

  const handleSubmit = async () => {
    if (!selectedLessonId) {
      notify("Iltimos, dars mavzusini tanlang!", "warning");
      return;
    }
    if (!comment.trim()) {
      notify("Iltimos, izoh kiriting!", "warning");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("group_id", groupId);
      formData.append("lesson_id", selectedLessonId);
      formData.append("title", comment);
      if (file) {
        formData.append("file", file);
      }

      await axios.post("http://localhost:3000/homework", formData, { headers });
      notify("Uyga vazifa muvaffaqiyatli e'lon qilindi!", "success");
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to create homework:", error);
      const errMsg = error.response?.data?.message || "Uyga vazifa yuklashda xatolik yuz berdi";
      notify(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Label yozuvlari uchun yordamchi komponent (qizil yulduzcha bilan)
  const RequiredLabel = ({ text }) => (
    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", mb: 1 }}>
      <span style={{ color: "#EF4444", marginRight: "4px" }}>*</span>
      {text}
    </Typography>
  );

  return (
    <Box sx={{ maxWidth: 900, p: 4, fontFamily: "sans-serif", bgcolor: "#FFFFFF" }}>
      
      {/* 1. Sarlavha qismi */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <IconButton onClick={onBack} sx={{ color: "#111827", p: 0.5 }}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
          Yangi uyga vazifa yaratish
        </Typography>
      </Box>

      {/* 2. Mavzu tanlash (Select) */}
      <Box sx={{ mb: 4 }}>
        <RequiredLabel text="Mavzu" />
        <Select
          fullWidth
          displayEmpty
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          sx={{
            height: 48,
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#10B981" },
            color: selectedLessonId === "" ? "#9CA3AF" : "#111827",
          }}
          IconComponent={UnfoldMoreIcon}
        >
          <MenuItem value="" disabled>
            Mavzulardan birini tanlang
          </MenuItem>
          {lessons.map((lesson) => (
            <MenuItem key={lesson.id} value={lesson.id}>
              {lesson.topic} ({new Date(lesson.created_at).toLocaleDateString()})
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 3. Izoh qismi (Rich Text Editor UI) */}
      <Box sx={{ mb: 4 }}>
        <RequiredLabel text="Izoh" />
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Editor Toolbar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              p: 1,
              borderBottom: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* H1, H2 */}
            <Typography sx={{ fontWeight: 700, cursor: "pointer", px: 1 }}>H1</Typography>
            <Typography sx={{ fontWeight: 700, cursor: "pointer", px: 1 }}>H2</Typography>
            
            {/* Sans Serif dropdown simulyatsiyasi */}
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer", px: 1 }}>
              <Typography sx={{ fontSize: 14 }}>Sans Serif</Typography>
              <UnfoldMoreIcon fontSize="small" sx={{ ml: 0.5, color: "#6B7280" }} />
            </Box>

            {/* Normal dropdown simulyatsiyasi */}
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer", px: 1 }}>
              <Typography sx={{ fontSize: 14 }}>Normal</Typography>
              <UnfoldMoreIcon fontSize="small" sx={{ ml: 0.5, color: "#6B7280" }} />
            </Box>

            {/* Asosiy formatlash ikonkalari */}
            <IconButton size="small"><FormatBoldIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatItalicIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatUnderlinedIcon fontSize="small" /></IconButton>
            <IconButton size="small"><StrikethroughSIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatQuoteIcon fontSize="small" /></IconButton>
            <IconButton size="small"><CodeIcon fontSize="small" /></IconButton>
            
            {/* Listlar va link */}
            <IconButton size="small"><FormatListNumberedIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatListBulletedIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatIndentDecreaseIcon fontSize="small" /></IconButton>
            <IconButton size="small"><FormatIndentIncreaseIcon fontSize="small" /></IconButton>
            <IconButton size="small"><LinkIcon fontSize="small" /></IconButton>
          </Box>

          {/* Editor Input maydoni */}
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                p: 2,
                "& fieldset": { border: "none" }, // Ichki borderlarni olib tashlaymiz
              },
            }}
          />
        </Box>
      </Box>

      {/* 4. Fayl yuklash qismi */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: "1px dashed #D1D5DB",
          borderRadius: 2,
          p: 2,
          mb: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { bgcolor: "#F9FAFB" },
        }}
      >
        <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B7280", fontSize: 14 }}>
          <FileUploadOutlinedIcon fontSize="small" />
          Fayl tanlash (Yuklash)
        </Typography>
      </Box>

      {file && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4, px: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#10B981", fontWeight: 500 }}>
            Tanlandi: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </Typography>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setFile(null); }} sx={{ color: "#EF4444" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {!file && <Box sx={{ mb: 3 }} />}

      {/* 5. Tugmalar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={saving}
          sx={{
            color: "#6B7280",
            borderColor: "#E5E7EB",
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            fontWeight: 500,
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSubmit}
          sx={{
            bgcolor: "#10B981", // Emerald-500
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: 2,
            px: 4,
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": { bgcolor: "#059669", boxShadow: "none" },
          }}
        >
          {saving ? "E'lon qilinmoqda..." : "E'lon qilish"}
        </Button>
      </Box>
    </Box>
  );
}