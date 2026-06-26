import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Breadcrumbs,
  Link,
  Container,
  Grid,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import { useNotify } from "../components/NotificationContext";

const BASE = "http://localhost:3000";

export default function GroupJournal({ groupId, groupName, onBack }) {
  const notify = useNotify();
  const [topic, setTopic] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: boolean }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [topicType, setTopicType] = useState("boshqa");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE}/student-group/group/${groupId}`, { headers });
        setStudents(res.data);
        const initial = {};
        res.data.forEach((sg) => {
          initial[sg.users.id] = true; 
        });
        setAttendance(initial);
      } catch (err) {
        console.error("Fetch students error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchStudents();
  }, [groupId]);

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async () => {
    if (!topic) {
      notify("Mavzuni kiriting!", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        group_id: groupId,
        topic,
        students: Object.keys(attendance).map((sId) => ({
          student_id: Number(sId),
          isPresent: attendance[sId],
        })),
      };
      await axios.post(`${BASE}/attendance`, payload, { headers });
      notify("Jurnal muvaffaqiyatli saqlandi!", "success");
      onBack();
    } catch (err) {
      const msg = err.response?.data?.message || "Xatolik yuz berdi";
      notify(msg, "error");
      console.error("Submit journal error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#f8fafc" }}>
      <CircularProgress sx={{ color: "#7c3aed" }} />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", bgcolor: "#f1f5f9", minHeight: "100vh" }}>
      {/* Top Navbar Simulation */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e2e8f0", px: 4, py: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: "#f8fafc", "&:hover": { bgcolor: "#f1f5f9" } }}>
          <ArrowBackIcon sx={{ color: "#64748b" }} />
        </IconButton>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" sx={{ fontSize: 13, cursor: "pointer" }} onClick={onBack}>Guruhlar</Link>
            <Typography color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>Jurnal</Typography>
          </Breadcrumbs>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", mt: -0.5 }}>
            {groupName}
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: "20px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
              <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                  Yo'qlama va yangi mavzu
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                    textTransform: "none",
                    borderRadius: "12px",
                    px: 6,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  {submitting ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 6, mb: 4, flexDirection: { xs: "column", md: "row" } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569", mb: 1.5 }}>
                    Tanlov turi
                  </Typography>
                  <RadioGroup row value={topicType} onChange={(e) => setTopicType(e.target.value)}>
                    <FormControlLabel
                      value="o'quv reja"
                      control={<Radio size="small" sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} />}
                      label={<Typography sx={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>O'quv reja bo'yicha</Typography>}
                    />
                    <FormControlLabel
                      value="boshqa"
                      control={<Radio size="small" sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} />}
                      label={<Typography sx={{ fontSize: 14, color: "#10b981", fontWeight: 700 }}>Boshqa mavzu</Typography>}
                    />
                  </RadioGroup>
                </Box>

                <Box sx={{ flex: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569", mb: 1.5 }}>
                    Bugungi mavzu nomi <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Mavzuni kiriting (masalan: React Hooks, Redux Toolkit...)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#f8fafc",
                        borderRadius: "12px",
                        fontWeight: 600,
                        border: "1px solid #e2e8f0",
                        "&:hover": { borderColor: "#cbd5e1" },
                        "&.Mui-focused": { borderColor: "#7c3aed", boxShadow: "0 0 0 4px rgba(124, 58, 237, 0.1)" },
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                </Box>
              </Box>

              <TableContainer component={Box}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ color: "#64748b", fontWeight: 700, borderBottom: "1px solid #f1f5f9", borderRadius: "10px 0 0 10px" }}>#</TableCell>
                      <TableCell sx={{ color: "#64748b", fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>O'QUVCHI ISMI</TableCell>
                      <TableCell sx={{ color: "#64748b", fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>DARS VAQTI</TableCell>
                      <TableCell align="right" sx={{ color: "#64748b", fontWeight: 700, borderBottom: "1px solid #f1f5f9", borderRadius: "0 10px 10px 0" }}>DAVOMAT (KELDI)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((sg, index) => (
                      <TableRow key={sg.users.id} hover sx={{ "&:hover": { bgcolor: "#fdfdfd" } }}>
                        <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 2.5, color: "#94a3b8", fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 2.5, fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                          {sg.users.first_name} {sg.users.last_name}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f8fafc", py: 2.5, color: "#64748b", fontWeight: 500 }}>09:30</TableCell>
                        <TableCell align="right" sx={{ borderBottom: "1px solid #f8fafc", py: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: attendance[sg.users.id] ? "#10b981" : "#94a3b8" }}>
                              {attendance[sg.users.id] ? "KELDI" : "KELMADI"}
                            </Typography>
                            <Switch
                              checked={attendance[sg.users.id] || false}
                              onChange={() => toggleAttendance(sg.users.id)}
                              sx={{
                                width: 50,
                                height: 26,
                                padding: 0,
                                "& .MuiSwitch-switchBase": {
                                  padding: 0,
                                  margin: "2px",
                                  transitionDuration: "300ms",
                                  "&.Mui-checked": {
                                    transform: "translateX(24px)",
                                    color: "#fff",
                                    "& + .MuiSwitch-track": {
                                      backgroundColor: "#10b981",
                                      opacity: 1,
                                      border: 0,
                                    },
                                  },
                                },
                                "& .MuiSwitch-thumb": {
                                  boxSizing: "border-box",
                                  width: 22,
                                  height: 22,
                                },
                                "& .MuiSwitch-track": {
                                  borderRadius: 26 / 2,
                                  backgroundColor: "#e2e8f0",
                                  opacity: 1,
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
