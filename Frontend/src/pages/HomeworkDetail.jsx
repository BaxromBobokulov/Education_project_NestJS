import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeworkReview from "./HomeworkReview";
import axios from "axios";

const BASE = "http://localhost:3000";

const STATUS_LABEL = {
  PENDING:    { label: "Kutayotganlar",     color: "#f59e0b", bg: "#fef9c3" },
  CHECKED:    { label: "Qabul qilinganlar", color: "#10b981", bg: "#dcfce7" },
  INCOMPLETE: { label: "Bajarilmagan",      color: "#ef4444", bg: "#fee2e2" },
};

export default function HomeworkDetail({ homework, onBack }) {
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedAnswer, setSelectedAnswer] = useState(null); // { answer_id, user_id, full_name, ... }
  const [detail, setDetail]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDetail = async () => {
    if (!homework?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/homework/${homework.id}/detail`, { headers });
      setDetail(res.data);
    } catch (e) {
      console.error("GET /homework/:id/detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [homework?.id]);

  // HomeworkReview dan qaytganda detail ni refresh qilamiz
  const handleBackFromReview = () => {
    setSelectedAnswer(null);
    fetchDetail();
  };

  if (selectedAnswer) {
    return (
      <HomeworkReview
        answerId={selectedAnswer.answer_id}
        studentName={selectedAnswer.full_name}
        homework={homework}
        onBack={handleBackFromReview}
      />
    );
  }

  const counts = detail?.counts || { PENDING: 0, CHECKED: 0, INCOMPLETE: 0 };
  const allStudents = detail?.students || [];

  const tabs = [
    { id: "ALL",       label: "Hammasi",          count: allStudents.length },
    { id: "PENDING",   label: "Kutayotganlar",     count: counts.PENDING },
    { id: "CHECKED",   label: "Qabul qilinganlar", count: counts.CHECKED },
    { id: "INCOMPLETE",label: "Bajarilmagan",      count: counts.INCOMPLETE },
  ];

  const filteredStudents = activeTab === "ALL"
    ? allStudents
    : allStudents.filter((s) => s.status === activeTab);

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={onBack} size="small" sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
          {homework?.title || "Homework"}
        </Typography>
      </Box>

      {/* Summary Card */}
      <Card sx={{ p: 2, mb: 3, borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Mavzu</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{homework?.title || "—"}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Guruh</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{detail?.group_name || "—"}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, color: "#94a3b8", mb: 0.5 }}>Berilgan vaqt</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
            {homework?.created_at ? new Date(homework.created_at).toLocaleString("uz-UZ") : "—"}
          </Typography>
        </Box>
        {/* Stat chips */}
        {/* <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", ml: "auto" }}>
          <Box sx={{ textAlign: "center", px: 2, py: 1, borderRadius: "8px", bgcolor: "#fef9c3" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#a16207" }}>{counts.PENDING}</Typography>
            <Typography sx={{ fontSize: 11, color: "#92400e" }}>Kutayotgan</Typography>
          </Box>
          <Box sx={{ textAlign: "center", px: 2, py: 1, borderRadius: "8px", bgcolor: "#dcfce7" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#166534" }}>{counts.CHECKED}</Typography>
            <Typography sx={{ fontSize: 11, color: "#166534" }}>Qabul</Typography>
          </Box>
          <Box sx={{ textAlign: "center", px: 2, py: 1, borderRadius: "8px", bgcolor: "#fee2e2" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#991b1b" }}>{counts.INCOMPLETE}</Typography>
            <Typography sx={{ fontSize: 11, color: "#991b1b" }}>Bajarilmagan</Typography>
          </Box>
        </Box> */}
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
              color: activeTab === tab.id ? "#1e293b" : "#64748b",
            }}>
              {tab.label}
            </Typography>
            {tab.count > 0 && (
              <Box sx={{
                minWidth: 20, height: 20, borderRadius: "10px",
                px: 0.5,
                bgcolor: activeTab === tab.id ? "#10b981" : "#f1f5f9",
                color: activeTab === tab.id ? "white" : "#64748b",
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {tab.count}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Students Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#10b981" }} />
        </Box>
      ) : (
        <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                <TableCell sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>O'quvchi ismi</TableCell>
                <TableCell align="center" sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Ball</TableCell>
                <TableCell align="right"  sx={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Yuborilgan vaqt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", color: "#94a3b8", py: 4 }}>
                    {activeTab === "ALL" ? "Talabalar topilmadi" : "Bu statusda talabalar yo'q"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const statusInfo = STATUS_LABEL[student.status] || STATUS_LABEL.INCOMPLETE;
                  const canReview  = student.status === "PENDING"; // Faqat javob berganlarga kirish
                  return (
                    <TableRow
                      key={student.user_id}
                      onClick={() => student.answer_id && setSelectedAnswer(student)}
                      sx={{
                        "&:last-child td": { border: 0 },
                        cursor: student.answer_id ? "pointer" : "default",
                        "&:hover": { bgcolor: student.answer_id ? "#f8fafc" : "inherit" },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={student.photo ? `${BASE}/${student.photo}` : undefined}
                            sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "#e0e7ff", color: "#4f46e5" }}
                          >
                            {student.full_name?.[0]}
                          </Avatar>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                            {student.full_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{ bgcolor: statusInfo.bg, color: statusInfo.color, fontWeight: 600, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: student.score !== null ? "#1e293b" : "#94a3b8" }}>
                          {student.score !== null ? student.score : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#64748b", fontSize: 13, py: 2 }}>
                        {student.submitted_at
                          ? new Date(student.submitted_at).toLocaleString("uz-UZ")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
