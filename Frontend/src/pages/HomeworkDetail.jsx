import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeworkReview from "./HomeworkReview";

export default function HomeworkDetail({ homework, onBack }) {
  const [activeTab, setActiveTab] = useState("kutayotganlar");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const tabs = [
    { id: "kutayotganlar", label: "Kutayotganlar", count: 5 },
    { id: "qaytarilganlar", label: "Qaytarilganlar", count: 0 },
    { id: "qabul qilinganlar", label: "Qabul qilinganlar", count: 0 },
    { id: "bajarilmagan", label: "Bajarilmagan", count: 6 },
  ];

  const students = [
    { name: "Nosirxon Ziyovutdinov", time: "15 May, 2026 09:54" },
    { name: "Mirsaid Abduqulov", time: "15 May, 2026 04:57" },
    { name: "Oydin Qalandarova Kamolovna", time: "14 May, 2026 17:06" },
    { name: "Guliza Ayitqulova", time: "15 May, 2026 10:09" },
    { name: "Mohirbek Solijonov", time: "15 May, 2026 06:48" },
  ];

  if (selectedStudent) {
    return <HomeworkReview student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={onBack} size="small" sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", textTransform: "lowercase" }}>
          {homework?.topic || "crm backend homework checking"}
        </Typography>
      </Box>

      {/* Summary Card */}
      <Card sx={{ p: 2, mb: 3, borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 1 }}>Mavzu</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{homework?.topic || "crm backend homework checking"}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 1 }}>Tugash vaqti</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>15 May, 2026 07:10</Typography>
        </Box>
      </Card>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 3, borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              pb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #10b981" : "2px solid transparent",
            }}
          >
            <Typography sx={{ 
              fontSize: 14, 
              fontWeight: activeTab === tab.id ? 600 : 400, 
              color: activeTab === tab.id ? "#1e293b" : "#64748b" 
            }}>
              {tab.label}
            </Typography>
            {tab.count > 0 && (
              <Box sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: "50%", 
                bgcolor: "#f59e0b", 
                color: "white", 
                fontSize: 11, 
                fontWeight: 700, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                {tab.count}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* List Table */}
      <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
              <TableCell sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>O'quvchi ismi</TableCell>
              <TableCell align="right" sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Uyga vazifa jo'natilgan vaqt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, idx) => (
              <TableRow 
                key={idx} 
                onClick={() => setSelectedStudent(student)}
                sx={{ "&:last-child td": { border: 0 }, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" } }}
              >
                <TableCell sx={{ color: "#1e293b", fontSize: 14, fontWeight: 500, py: 2 }}>{student.name}</TableCell>
                <TableCell align="right" sx={{ color: "#1e293b", fontSize: 13, py: 2 }}>{student.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
