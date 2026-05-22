import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  Grid,
  Slider,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MicIcon from "@mui/icons-material/Mic";
import InfoIcon from "@mui/icons-material/Info";

export default function HomeworkReview({ student, onBack }) {
  const [score, setScore] = useState(60);

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Typography 
          onClick={onBack} 
          sx={{ fontSize: 16, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}
        >
          Kutayotganlar
        </Typography>
        <Typography sx={{ color: "#94a3b8" }}>&gt;</Typography>
        <Typography sx={{ fontSize: 16, color: "#64748b" }}>Uyga vazifa</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top Section - Details */}
        <Grid item xs={12}>
          {/* Section 1: Uy vazifasi */}
          <Card sx={{ p: 2, mb: 3, borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2, color: "#1e293b" }}>Uy vazifasi</Typography>
            <Box sx={{ bgcolor: "#fcfdff", p: 2, borderRadius: "8px", border: "1px solid #f1f5f9" }}>
              <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Izoh:</Typography>
              <Typography sx={{ fontSize: 14, color: "#1e293b" }}>
                Homework tekshirish qismini qilish backend
              </Typography>
            </Box>
          </Card>

          {/* Section 2: Student Info */}
          <Card sx={{ p: 2, borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", bgcolor: "#fcfdff", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}>
              {student?.name || "Nosirxon Ziyovutdinov"}
            </Typography>
            
            <Card sx={{ p: 2, mb: 3, borderRadius: "10px", boxShadow: "none", border: "1px solid #f1f5f9" }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Vaqti:</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{student?.time || "15 May, 2026 09:54"}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Fayllar soni:</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>3</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Status:</Typography>
                  <Chip label="Kutayabti" size="small" sx={{ bgcolor: "#fef9c3", color: "#a16207", fontWeight: 700, fontSize: 11 }} />
                </Grid>
              </Grid>
            </Card>

            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1, fontWeight: 500 }}>Fayl: 3</Typography>
            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
              {/* Mockup images */}
              <Box sx={{ width: 120, height: 80, bgcolor: "#eee", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img src="/placeholder_ui.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </Box>
              <Box sx={{ width: 120, height: 80, bgcolor: "#eee", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img src="/placeholder_ui.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </Box>
              <Box sx={{ width: 120, height: 80, bgcolor: "#eee", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img src="/placeholder_ui.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </Box>
            </Box>

            <Box sx={{ p: 2, borderRadius: "8px", borderLeft: "4px solid #3b82f6", bgcolor: "#f8fafc" }}>
              <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>Uyga vazifa izohi:</Typography>
              <Typography sx={{ fontSize: 14, color: "#2563eb", fontWeight: 600, wordBreak: "break-all" }}>
                https://github.com/Nosirhon-01/CRM_Fullsatck:
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Bottom Section - Grading */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0" }}>
            <Alert 
              icon={<InfoIcon fontSize="small" />} 
              sx={{ 
                bgcolor: "#eff6ff", 
                color: "#1e40af", 
                fontSize: 12, 
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
                mb: 4,
                "& .MuiAlert-icon": { color: "#3b82f6" }
              }}
            >
              60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
            </Alert>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Ball</Typography>
                <Box sx={{ border: "1px solid #e2e8f0", borderRadius: "4px", px: 1.5, py: 0.5, fontSize: 14, fontWeight: 600 }}>
                  {score}
                </Box>
              </Box>
              <Slider
                value={score}
                onChange={(e, v) => setScore(v)}
                sx={{
                  color: "#10b981",
                  height: 6,
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    backgroundColor: "#fff",
                    border: "2px solid currentColor",
                  },
                  "& .MuiSlider-track": { border: "none" },
                  "& .MuiSlider-rail": { opacity: 0.5, backgroundColor: "#bfdbfe" },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>O'tish bali</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>Fayllar</Typography>
              <Box 
                sx={{ 
                  border: "1px dashed #10b981", 
                  borderRadius: "10px", 
                  p: 4, 
                  textAlign: "center",
                  bgcolor: "#f0fdf4",
                  cursor: "pointer"
                }}
              >
                <CloudUploadIcon sx={{ color: "#10b981", fontSize: 32, mb: 1 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1e293b", mb: 0.5 }}>
                  Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                  .jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Izohingiz"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "#fcfdff",
                    fontSize: 14
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" sx={{ color: "#10b981", mb: -4, mr: -1 }}>
                      <MicIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={onBack}
                sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0", py: 1 }}
              >
                Bekor qilish
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: "#10b981", textTransform: "none", borderRadius: "8px", py: 1, "&:hover": { bgcolor: "#059669" } }}
              >
                Yuborish
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
