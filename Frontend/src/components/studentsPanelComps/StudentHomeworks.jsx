import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

// Statuslar uchun Maxsus Badge (Chip) componenti
const StatusBadge = ({ status }) => {
  let bgColor = "#6F7577"; // Berilmagan uchun kulrang

  if (status === "Qabul qilingan") bgColor = "#5BBC5D"; // Yashil
  else if (status === "Kutayotgan") bgColor = "#617AF1"; // Ko'k
  else if (status === "Bajarilmagan") bgColor = "#FF3300"; // Qizil
  else if (status === "Qaytarilgan") bgColor = "#FFBC25"; // Sariq/To'q sariq

  return (
    <Box
      sx={{
        bgcolor: bgColor,
        color: "#fff",
        py: 0.6,
        px: 1.5,
        borderRadius: 1.5,
        display: "inline-block",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.3px",
      }}
    >
      {status}
    </Box>
  );
};

// Videolar soni uchun dumaloq indikator componenti
const VideoCount = ({ count }) => (
  <Box
    sx={{
      width: 26,
      height: 26,
      borderRadius: "50%",
      border: "1.5px solid #28A5E8", // Ochiq ko'k hoshiya
      color: "#28A5E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      fontWeight: 500,
    }}
  >
    {count}
  </Box>
);

const formatUzDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
};

const formatUzDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} ${hours}:${minutes}`;
};

export default function HomeworkTable({ groupId, groupName, onBack, onLessonSelect }) {
  const [filter, setFilter] = useState("Barchasi");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/groups/${groupId}/lessons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLessons(response.data);
      } catch (error) {
        console.error("Darslarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchLessons();
    }
  }, [groupId]);

  const formattedData = lessons.map((row) => {
    return {
      id: row.id,
      topic: row.topic || "Mavzu topilmadi",
      video: row.videoCount || 0,
      status: row.homeworkStatus || "Berilmagan",
      deadline: row.deadline ? formatUzDateTime(row.deadline) : "-",
      date: formatUzDate(row.created_at),
    };
  });

  const filteredData = formattedData.filter((row) => {
    if (filter === "Barchasi") return true;
    return row.status === filter;
  });

  return (
    <Box sx={{ bgcolor: "#F0F4F8", minHeight: "100vh", p: 4, fontFamily: "sans-serif" }}>
      
      {/* Sarlavha qismi */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onBack}
          sx={{
            borderColor: "#C4843D",
            color: "#C4843D",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            py: 0.8,
            fontWeight: 500,
            "&:hover": {
              borderColor: "#B88E5F",
              bgcolor: "#FAF3EB"
            }
          }}
        >
          ← Orqaga
        </Button>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#111827", flex: 1, textAlign: "center", mr: 12 }}
        >
          {groupName || "Guruh Vazifalari"}
        </Typography>
      </Box>

      {/* Filtr qismi */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: "#6B7280", fontSize: "14px", mb: 1, ml: 0.5 }}>
          Uy vazifa statusi
        </Typography>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{
            bgcolor: "#fff",
            width: "200px",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#D1D5DB",
            },
          }}
        >
          <MenuItem value="Barchasi">Barchasi</MenuItem>
          <MenuItem value="Berilmagan">Berilmagan</MenuItem>
          <MenuItem value="Kutayotgan">Kutayotgan</MenuItem>
          <MenuItem value="Bajarilmagan">Bajarilmagan</MenuItem>
          <MenuItem value="Qaytarilgan">Qaytarilgan</MenuItem>
          <MenuItem value="Qabul qilingan">Qabul qilingan</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#C4843D" }} />
        </Box>
      ) : filteredData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Typography sx={{ color: "#6B7280" }}>
            Bu bo'limda uy vazifalari topilmadi.
          </Typography>
        </Paper>
      ) : (
        /* Jadval */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #E5E7EB",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 800, borderCollapse: "collapse" }}>
            
            {/* Jadval Bosh qismi */}
            <TableHead>
              <TableRow sx={{ borderBottom: "1.5px solid #E5E7EB" }}>
                <TableCell sx={{ fontWeight: 700, color: "#000", py: 2.5, width: '30%' }}>
                  Mavzular
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#000", py: 2.5 }}>
                  Video
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#000", py: 2.5 }}>
                  Uyga vazifa Holati
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#000", py: 2.5 }}>
                  Uyga vazifa tugash vaqti <span style={{ fontSize: '16px', verticalAlign: 'middle', marginLeft: '4px' }}>↓</span>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#000", py: 2.5 }}>
                  Dars sanasi <span style={{ color: '#22C55E', fontSize: '16px', verticalAlign: 'middle', marginLeft: '4px' }}>↑</span>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Jadval Tana qismi */}
            <TableBody>
              {filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onLessonSelect && onLessonSelect(row)}
                  sx={{
                    cursor: "pointer",
                    borderBottom: "1px solid #F3F4F6",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {/* Mavzu */}
                  <TableCell sx={{ color: "#1F2937", fontSize: "14px", py: 2 }}>
                    {row.topic}
                  </TableCell>
                  
                  {/* Video */}
                  <TableCell sx={{ py: 2 }}>
                    <VideoCount count={row.video} />
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell sx={{ py: 2 }}>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  
                  {/* Tugash vaqti */}
                  <TableCell sx={{ color: "#1F2937", fontSize: "14px", py: 2 }}>
                    {row.deadline}
                  </TableCell>
                  
                  {/* Dars sanasi */}
                  <TableCell sx={{ color: "#1F2937", fontSize: "14px", py: 2 }}>
                    {row.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Box>
  );
}