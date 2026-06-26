import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useNotify } from "./NotificationContext";
import { isAuthenticated, setToken } from "../utils/auth";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();

  const API = "http://localhost:3000/login";

  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const loginPost = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(API, {
        email: login,
        password: password,
      });

      setToken(res.data.token);
      notify("Muvaffaqiyatli kirdingiz!", "success");
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || "Login yoki parol xato!";
      notify(msg, "error");
    }
  };

  // Inputlar uchun umumiy stil
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#F8FAFC", // Tailwind bg-slate-50
      height: "48px",
      "& fieldset": { borderColor: "#E2E8F0" }, // border-slate-200
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { 
        borderColor: "#6366F1", // indigo-500
        borderWidth: "2px"
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "14px",
      fontWeight: 600,
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", bgcolor: "#F8FAFC", fontFamily: "sans-serif" }}>
      
      {/* ───────────── LEFT PANEL (Faqat katta ekranlarda ko'rinadi) ───────────── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "55%",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "40%",
            height: "40%",
            borderRadius: "50%",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            filter: "blur(64px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "40%",
            height: "40%",
            borderRadius: "50%",
            bgcolor: "rgba(168, 85, 247, 0.1)", // purple-500/10
            filter: "blur(64px)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <img
            src="/study.svg"
            alt="Student studying"
            style={{
              width: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.25))",
              marginBottom: "32px",
              transition: "transform 700ms",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Box>
      </Box>

      {/* ───────────── RIGHT PANEL ───────────── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: { xs: "100%", lg: "45%" },
          bgcolor: "white",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: "-20px 0 40px rgba(0,0,0,0.02)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "448px", px: 5 }}>
          
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: "16px",
                bgcolor: "#F8FAFC",
                p: 2,
                border: "1px solid #F1F5F9",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <img
                src="/Najot_ta'lim_Logo.jpg"
                alt="Najot ta'lim Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
              />
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", mb: 1 }}>
              Xush kelibsiz!
            </Typography>
            <Typography sx={{ color: "#64748B", fontWeight: 500 }}>
              Tizimga kirish uchun ma'lumotlaringizni kiriting
            </Typography>
          </Box>

          <form onSubmit={loginPost} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Email kiritish */}
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#334155", mb: 1, ml: 0.5 }}>
                Email manzilingiz
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="example@mail.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                sx={inputStyles}
              />
            </Box>

            {/* Parol kiritish */}
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#334155", mb: 1, ml: 0.5 }}>
                Maxfiy parol
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={inputStyles}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#94A3B8", "&:hover": { color: "#4F46E5" } }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Kirish tugmasi */}
            <Button
              type="submit"
              fullWidth
              sx={{
                height: "48px",
                bgcolor: "#4F46E5", // indigo-600
                color: "white",
                fontWeight: 800,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "16px",
                boxShadow: "0 10px 15px -3px rgba(199, 210, 254, 0.5)", // shadow-lg shadow-indigo-200
                mt: 2,
                "&:hover": { bgcolor: "#4338CA" }, // indigo-700
                "&:active": { transform: "scale(0.98)" },
                transition: "all 200ms",
              }}
            >
              Kirish
            </Button>
          </form>

          {/* Parolni unutdingizmi? */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography
              onClick={() => navigate("/forgot-password")}
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#4F46E5",
                cursor: "pointer",
                transition: "color 200ms",
                "&:hover": { color: "#4338CA" },
              }}
            >
              Parolni unutdingizmi?
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            position: "absolute",
            bottom: "32px",
            color: "#94A3B8",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Copyright © 2026 Najot Ta'lim LMS
        </Typography>
      </Box>
    </Box>
  );
}