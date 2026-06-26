import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../components/NotificationContext";
import axios from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const notify = useNotify();

  // Qadamlar: 1 - Phone, 2 - OTP kiritish, 3 - Yangi parol
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Input state'lari
  const [phone, setPhone] = useState("+998");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const cleanPhone = (val) => {
    // Faqat raqamlar va plus belgisini qoldiramiz
    let digits = val.replace(/[^\d+]/g, "");
    if (digits.startsWith("998") && !digits.startsWith("+")) {
      digits = "+" + digits;
    }
    if (digits.length === 9 && !digits.startsWith("+") && !digits.startsWith("998")) {
      digits = "+998" + digits;
    }
    return digits;
  };

  const handleSendOtp = async () => {
    const formattedPhone = cleanPhone(phone);
    if (!formattedPhone || formattedPhone.length < 12) {
      notify("Iltimos, to'g'ri telefon raqam kiriting!", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/login/send-otp", {
        phone: formattedPhone,
      });
      notify("Tasdiqlash kodi telefon raqamingizga yuborildi!", "success");
      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);
      const errMsg = error.response?.data?.message || "OTP yuborishda xatolik yuz berdi";
      notify(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      notify("Iltimos, 6 xonali tasdiqlash kodini kiriting!", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/login/verify-otp", {
        phone: cleanPhone(phone),
        code: otp,
      });
      notify("Kod muvaffaqiyatli tasdiqlandi!", "success");
      setStep(3);
    } catch (error) {
      console.error("Verify OTP error:", error);
      const errMsg = error.response?.data?.message || "Kod noto'g'ri yoki muddati tugagan";
      notify(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      notify("Parol kamida 6 ta belgidan iborat bo'lishi kerak!", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("Parollar bir-biriga mos kelmadi!", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.put("http://localhost:3000/login/update-password", {
        phone: cleanPhone(phone),
        password: newPassword,
      });
      notify("Parolingiz muvaffaqiyatli o'zgartirildi!", "success");
      navigate("/login");
    } catch (error) {
      console.error("Update password error:", error);
      const errMsg = error.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi";
      notify(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#F9FAFB",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#D1D5DB" },
      "&.Mui-focused fieldset": { borderColor: "#10B981" },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F3F4F6", // Umumiy orqa fon
        p: 2,
        fontFamily: "sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 450,
          width: "100%",
          p: 4,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Orqaga qaytish tugmasi */}
        <IconButton onClick={step > 1 ? handlePrevStep : () => navigate("/login")} sx={{ mb: 2, color: "#6B7280" }} disabled={loading}>
          <ArrowBackIcon />
        </IconButton>

        {/* --- 1-QADAM: Telefon kiritish --- */}
        {step === 1 && (
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827", mb: 1 }}>
              Parolni tiklash
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 3 }}>
              Ro'yxatdan o'tgan telefon raqamingizni kiriting. Biz tasdiqlash kodini yuboramiz.
            </Typography>

            <TextField
              fullWidth
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={inputStyles}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              disabled={loading || !phone || phone === "+998"}
              sx={{
                mt: 4,
                bgcolor: "#10B981",
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "none",
                "&:hover": { bgcolor: "#059669", boxShadow: "none" },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Kodni yuborish"}
            </Button>
          </Box>
        )}

        {/* --- 2-QADAM: OTP Kodni tasdiqlash --- */}
        {step === 2 && (
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827", mb: 1 }}>
              Kodni tasdiqlash
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 3 }}>
              <strong style={{ color: "#374151" }}>{phone}</strong> manziliga yuborilgan 6 xonali tasdiqlash kodini kiriting.
            </Typography>

            <TextField
              fullWidth
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 6, style: { textAlign: "center", letterSpacing: "8px", fontSize: "20px", fontWeight: 600 } }}
              sx={inputStyles}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              sx={{
                mt: 4,
                bgcolor: "#10B981",
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "none",
                "&:hover": { bgcolor: "#059669", boxShadow: "none" },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Tasdiqlash"}
            </Button>
            
            <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "#6B7280" }}>
              Kod kelmadimi?{" "}
              <span 
                style={{ color: "#10B981", fontWeight: 600, cursor: "pointer" }}
                onClick={!loading ? handleSendOtp : undefined}
              >
                Qaytadan yuborish
              </span>
            </Typography>
          </Box>
        )}

        {/* --- 3-QADAM: Yangi parol yaratish --- */}
        {step === 3 && (
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827", mb: 1 }}>
              Yangi parol
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 3 }}>
              Telefon raqam: <strong style={{ color: "#374151" }}>{phone}</strong> uchun yangi, ishonchli parol o'rnating.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Yangi parol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={inputStyles}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyOutlinedIcon sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff sx={{ color: "#9CA3AF" }} /> : <Visibility sx={{ color: "#9CA3AF" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Parolni tasdiqlang"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={inputStyles}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={loading}>
                        {showConfirmPassword ? <VisibilityOff sx={{ color: "#9CA3AF" }} /> : <Visibility sx={{ color: "#9CA3AF" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleUpdatePassword}
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              sx={{
                mt: 4,
                bgcolor: "#10B981",
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "none",
                "&:hover": { bgcolor: "#059669", boxShadow: "none" },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Parolni saqlash"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
