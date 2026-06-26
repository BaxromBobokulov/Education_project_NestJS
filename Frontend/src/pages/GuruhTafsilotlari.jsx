import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, RadioGroup, FormControlLabel, CircularProgress, Avatar, Switch } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

import GroupInfo from "../components/GroupInfo";
import GroupAttendance from "../components/GroupAttendance";
import GroupLessons from "../components/GroupLessons";
import HomeworkDetail from "./HomeworkDetail";
import GroupJournal from "./GroupJournal";
import HomeworkAnnaunance from "../components/HomeworkAnnaunance";

const BASE = "http://localhost:3000";

export default function GuruhTafsilotlari({ groupId, onBack }) {
  const [tab, setTab] = useState("ma'lumotlar");
  const [subTab, setSubTab] = useState("uyga vazifa");
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [openAddVideo, setOpenAddVideo] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [group, setGroup] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendanceDay, setSelectedAttendanceDay] = useState(null);

  // Add homework/exam modal state
  const [showAddContent, setShowAddContent] = useState(false);
  const [addContentType, setAddContentType] = useState("homework"); // "homework" or "exam"
  const [availableLessons, setAvailableLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentFile, setContentFile] = useState(null);
  const [addingContent, setAddingContent] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`${BASE}/groups/${groupId}`, { headers });
        setGroup(res.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    if (groupId) fetchGroup();
  }, [groupId]);

  // Refresh videos function exposed via window for GroupLessons to call
  const refreshGroupVideos = () => {
    if (groupId) {
      axios.get(`${BASE}/lessons/group/${groupId}`, { headers }).then(res => setVideos(res.data));
    }
  };

  useEffect(() => {
    window.refreshVideos = refreshGroupVideos;
    return () => { delete window.refreshVideos; };
  }, [groupId]);

  useEffect(() => {
    if (groupId && tab === "guruh darsliklari") {
      axios.get(`${BASE}/homework/group/${groupId}`, { headers }).then(res => setHomeworks(res.data));
      axios.get(`${BASE}/lessons/group/${groupId}`, { headers }).then(res => setVideos(res.data));
      axios.get(`${BASE}/exam/group/${groupId}`, { headers }).then(res => setExams(res.data));
    }
  }, [groupId, tab, subTab]);

  // Fetch lessons when opening add homework/exam modal
  const handleOpenAddContent = async (type) => {
    setAddContentType(type);
    setShowAddContent(true);
    setContentTitle("");
    setContentFile(null);
    setSelectedLessonId("");

    try {
      const endpoint = type === "homework"
        ? `${BASE}/homework/group/${groupId}/lessons`
        : `${BASE}/exam/group/${groupId}/lessons`;
      const res = await axios.get(endpoint, { headers });
      setAvailableLessons(res.data);
    } catch (e) {
      console.error("Failed to fetch lessons:", e);
      setAvailableLessons([]);
    }
  };

  const handleCreateContent = async () => {
    if (!selectedLessonId || !contentTitle.trim()) return;

    setAddingContent(true);
    try {
      const endpoint = addContentType === "homework"
        ? `${BASE}/homework`
        : `${BASE}/exam`;

      const formData = new FormData();
      formData.append("group_id", groupId);
      formData.append("lesson_id", selectedLessonId);
      formData.append("title", contentTitle);
      if (contentFile) {
        formData.append("file", contentFile);
      }

      await axios.post(endpoint, formData, { headers });

      // Refresh data
      if (addContentType === "homework") {
        const res = await axios.get(`${BASE}/homework/group/${groupId}`, { headers });
        setHomeworks(res.data);
      } else {
        const res = await axios.get(`${BASE}/exam/group/${groupId}`, { headers });
        setExams(res.data);
      }

      setShowAddContent(false);
    } catch (e) {
      console.error("Failed to create content:", e);
    } finally {
      setAddingContent(false);
    }
  };

  if (loading) return <Box sx={{ p: 3 }}>Yuklanmoqda...</Box>;
  if (!group) return <Box sx={{ p: 3 }}>Guruh topilmadi.</Box>;

  if (selectedAttendanceDay) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100%", p: 4 }}>
        <GroupAttendance
          group={group}
          initialSelectedDay={selectedAttendanceDay}
          onBack={() => setSelectedAttendanceDay(null)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100%", p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={onBack} sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}><ChevronLeftIcon /></IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>{group.name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Chip label={group.status?.toUpperCase()} size="small" sx={{ bgcolor: group.status === 'active' ? "#dcfce7" : "#f1f5f9", color: group.status === 'active' ? "#166534" : "#475569", fontWeight: 700, fontSize: 10, height: 20 }} />
              <Typography sx={{ color: "#64748b", fontSize: 13 }}>• {group.courses?.name}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<QueryStatsIcon />} sx={{ borderRadius: "12px", color: "#475569", bgcolor: "white", textTransform: "none", fontWeight: 700 }}>Statistika</Button>
          <Button variant="contained" sx={{ bgcolor: "#7c3aed", borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 4 }}>Tahrirlash</Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", mb: 4 }}>
        {["Ma'lumotlar", "Guruh darsliklari", "Akademik davomat"].map((t) => (
          <Box
            key={t}
            onClick={() => { setTab(t.toLowerCase()); setShowAddHomework(false); setSelectedHomework(null); setShowAddContent(false); }}
            sx={{ pb: 1.5, fontSize: 14, fontWeight: tab === t.toLowerCase() ? 800 : 500, color: tab === t.toLowerCase() ? "#7c3aed" : "#64748b", borderBottom: tab === t.toLowerCase() ? "3px solid #7c3aed" : "3px solid transparent", cursor: "pointer" }}
          >
            {t}
          </Box>
        ))}
      </Box>

      {/* Tab content rendering */}
      {tab === "ma'lumotlar" && <GroupInfo group={group} onSelectDate={(date) => setSelectedAttendanceDay(date)} />}

      {tab === "guruh darsliklari" && !showAddHomework && !selectedHomework && !showAddContent && (
        <GroupLessons
          subTab={subTab} setSubTab={setSubTab} videos={videos} homeworks={homeworks} exams={exams}
          setOpenAddVideo={setOpenAddVideo} openAddVideo={openAddVideo}
          setShowAddHomework={setShowAddHomework} setSelectedHomework={setSelectedHomework}
          playingVideo={playingVideo} setPlayingVideo={setPlayingVideo}
          onAddHomework={() => setShowAddHomework(true)}
          onAddExam={() => handleOpenAddContent("exam")}
          groupId={groupId}
        />
      )}

      {tab === "guruh darsliklari" && showAddHomework && (
        <HomeworkAnnaunance
          groupId={groupId}
          onBack={() => setShowAddHomework(false)}
          onSaveSuccess={() => {
            setShowAddHomework(false);
            axios.get(`${BASE}/homework/group/${groupId}`, { headers }).then(res => setHomeworks(res.data));
          }}
        />
      )}

      {selectedHomework && <HomeworkDetail homework={selectedHomework} onBack={() => setSelectedHomework(null)} />}

      {/* Add Homework/Exam Modal */}
      <Dialog open={showAddContent} onClose={() => setShowAddContent(false)} maxWidth="md" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: "12px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
            {addContentType === "homework" ? "Uyga vazifa qo'shish" : "Imtihon qo'shish"}
          </Typography>
          <IconButton onClick={() => setShowAddContent(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1, display: "block" }}>
              Dars mavzusi <span style={{ color: "red" }}>*</span>
            </Typography>
            <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", height: 44, fontSize: 13 } }}>
              <InputLabel shrink id="lesson-select-label">Darsni tanlang</InputLabel>
              <Select
                labelId="lesson-select-label"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                displayEmpty
                notched
              >
                <MenuItem value="" disabled>Darsni tanlang</MenuItem>
                {availableLessons.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id}>
                    {lesson.topic} ({new Date(lesson.created_at).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1, display: "block" }}>
              Mavzu nomi <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder={addContentType === "homework" ? "Uyga vazifa mavzusini kiriting" : "Imtihon mavzusini kiriting"}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", height: 44, fontSize: 13, bgcolor: "#f8fafc" } }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1, display: "block" }}>
              Fayl (ixtiyoriy)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#e2e8f0", color: "#64748b", cursor: "pointer" }}
            >
              Fayl tanlash
              <input
                type="file"
                hidden
                onChange={(e) => setContentFile(e.target.files[0])}
              />
            </Button>
            {contentFile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#10b981" }}>
                  Tanlangan: {contentFile.name}
                </Typography>
                <IconButton size="small" onClick={() => setContentFile(null)} sx={{ color: "#ef4444" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={() => setShowAddContent(false)} sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0" }}>Bekor qilish</Button>
            <Button
              variant="contained"
              onClick={handleCreateContent}
              disabled={addingContent || !selectedLessonId || !contentTitle.trim()}
              sx={{ bgcolor: "#10b981", textTransform: "none", borderRadius: "8px", px: 4, "&:hover": { bgcolor: "#059669" } }}
            >
              {addingContent ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}