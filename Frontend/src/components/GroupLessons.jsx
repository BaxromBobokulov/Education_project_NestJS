import { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, TextField as MuiTextField, Select as MuiSelect, MenuItem as MuiMenuItem, FormControl, InputLabel } from "@mui/material";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";
import VideoUploadModal from "./VideoUploadModal";

const BASE = "http://localhost:3000";

export default function GroupLessons({ 
  subTab, setSubTab, videos, homeworks, exams, 
  setOpenAddVideo, openAddVideo, handleCreateVideo, 
  setShowAddHomework, setSelectedHomework, playingVideo, setPlayingVideo,
  onAddHomework, onAddExam, groupId
}) {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [videoTopic, setVideoTopic] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (openAddVideo) {
      setVideoTopic("");
      setVideoFile(null);
    }
  }, [openAddVideo]);

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    if (!videoTopic.trim()) {
      alert("Iltimos, dars nomini kiriting");
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("group_id", groupId);
      formData.append("topic", videoTopic);
      formData.append("video", videoFile);
      
      await axios.post(`${BASE}/lessons/video-only`, formData, { headers });
      setOpenAddVideo(false);
      if (window.refreshVideos) window.refreshVideos();
    } catch (e) {
      console.error("Failed to upload video:", e);
      alert("Video yuklanmadi: " + (e?.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "10px" }}>
          {["Uyga vazifa", "Videolar", "Imtihonlar"].map((st) => (
            <Button
              key={st}
              onClick={() => setSubTab(st.toLowerCase())}
              sx={{
                textTransform: "none", px: 3, py: 1, borderRadius: "8px",
                bgcolor: subTab === st.toLowerCase() ? "white" : "transparent",
                color: subTab === st.toLowerCase() ? "#1e293b" : "#64748b",
                fontWeight: 600, boxShadow: subTab === st.toLowerCase() ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                "&:hover": { bgcolor: subTab === st.toLowerCase() ? "white" : "#e2e8f0" },
              }}
            >
              {st}
            </Button>
          ))}
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            if (subTab === "videolar") {
              setOpenAddVideo(true);
            } else if (subTab === "uyga vazifa") {
              onAddHomework?.();
            } else if (subTab === "imtihonlar") {
              onAddExam?.();
            }
          }}
          sx={{ bgcolor: "#10b981", textTransform: "none", borderRadius: "8px", fontWeight: 600, "&:hover": { bgcolor: "#059669" } }}
        >
          {subTab === "videolar" ? "Qo'shish" : subTab === "uyga vazifa" ? "Uyga vazifa qo'shish" : "Imtihon qo'shish"}
        </Button>
      </Box>

      {subTab === "videolar" ? (
        <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { color: "#64748b", fontSize: 12, fontWeight: 600, py: 1.5 } }}>
                <TableCell>Fan / Mavzu</TableCell>
                <TableCell>Dars nomi</TableCell>
                <TableCell>Video</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Qo'shilgan vaqti</TableCell>
                <TableCell align="right">Harakatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", color: "#94a3b8", py: 4 }}>
                    Videolar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((row) => (
                  <TableRow key={row.id} sx={{ "& td": { color: "#1e293b", fontSize: 13, py: 2 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover": { color: "#10b981" } }} onClick={() => setPlayingVideo(row)}>
                        <PlayCircleOutlinedIcon sx={{ color: "#10b981", fontSize: 20 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>{row.topic}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.topic}</TableCell>
                    <TableCell>
                      {row.video ? (
                        <Chip label="Video bor" size="small" sx={{ bgcolor: "#f0fdf4", color: "#10b981", fontWeight: 600, fontSize: 11, height: 20 }} />
                      ) : (
                        <Chip label="Video yo'q" size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 11, height: 20 }} />
                      )}
                    </TableCell>
                    <TableCell><Chip label={row.status} size="small" sx={{ bgcolor: "#f0fdf4", color: "#10b981", fontWeight: 600, fontSize: 11, height: 20 }} /></TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : subTab === "uyga vazifa" ? (
        <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { color: "#64748b", fontSize: 12, fontWeight: 600, py: 1.5 } }}>
                <TableCell>#</TableCell>
                <TableCell>Mavzu</TableCell>
                <TableCell align="center"><PeopleOutlinedIcon sx={{ fontSize: 18 }} /></TableCell>
                <TableCell align="center"><AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#f59e0b" }} /></TableCell>
                <TableCell align="center"><CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: "#10b981" }} /></TableCell>
                <TableCell>Berilgan vaqt</TableCell>
                <TableCell>Tugash vaqt</TableCell>
                <TableCell>Dars sanasi</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworks.map((row) => (
                <TableRow key={row.id} sx={{ "& td": { color: "#1e293b", fontSize: 13, py: 2 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                  <TableCell onClick={() => setSelectedHomework(row)} sx={{ fontWeight: 500, maxWidth: 300, cursor: "pointer", "&:hover": { color: "#10b981" } }}>
                    {row.title}
                  </TableCell>
                  <TableCell align="center">{row.homeworkAnswerStudents?.length || 0}</TableCell>
                  <TableCell align="center">0</TableCell>
                  <TableCell align="center">0</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(row.created_at).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>--</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : subTab === "imtihonlar" ? (
        <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { color: "#64748b", fontSize: 12, fontWeight: 600, py: 1.5 } }}>
                <TableCell>#</TableCell>
                <TableCell>Mavzu</TableCell>
                <TableCell align="center"><AssignmentIcon sx={{ fontSize: 18, color: "#7c3aed" }} /></TableCell>
                <TableCell align="center"><AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#f59e0b" }} /></TableCell>
                <TableCell align="center"><CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: "#10b981" }} /></TableCell>
                <TableCell>Berilgan vaqt</TableCell>
                <TableCell>Tugash vaqt</TableCell>
                <TableCell>Dars sanasi</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((row) => (
                <TableRow key={row.id} sx={{ "& td": { color: "#1e293b", fontSize: 13, py: 2 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500, maxWidth: 300 }}>
                    {row.title}
                  </TableCell>
                  <TableCell align="center">0</TableCell>
                  <TableCell align="center">0</TableCell>
                  <TableCell align="center">0</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(row.created_at).toLocaleString()}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>--</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {/* Video Player Modal */}
      <Dialog open={!!playingVideo} onClose={() => setPlayingVideo(null)} maxWidth="md" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: "12px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{playingVideo?.topic || "Video"}</Typography>
          <IconButton onClick={() => setPlayingVideo(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#000", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {playingVideo?.video ? (
            <video 
              controls 
              style={{ width: "100%", height: "auto", maxHeight: "70vh" }}
            >
              <source src={`${BASE}/lessons/video/${playingVideo.video}`} type="video/mp4" />
              Brauzeringiz videoni qo'llab-quvvatlamaydi
            </video>
          ) : (
            <Box sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <PlayArrowIcon sx={{ color: "white", fontSize: 40 }} />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Upload Modal */}
      <VideoUploadModal
        open={openAddVideo}
        onClose={() => setOpenAddVideo(false)}
        groupId={groupId}
        onSuccess={() => {
          if (window.refreshVideos) window.refreshVideos();
        }}
      />
    </Box>
  );
}