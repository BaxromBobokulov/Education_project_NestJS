import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Card,
  Grid,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  TextField as MuiTextField,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import HomeworkDetail from "./HomeworkDetail";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`${BASE}/groups/${groupId}`, { headers });
        setGroup(res.data);
      } catch (e) {
        console.error("Fetch group error:", e);
      } finally {
        setLoading(false);
      }
    };

    const fetchHomeworks = async () => {
      try {
        const res = await axios.get(`${BASE}/homework/group/${groupId}`, { headers });
        setHomeworks(res.data);
      } catch (e) {
        console.error("Fetch homework error:", e);
      }
    };

    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${BASE}/lessons/group/${groupId}`, { headers });
        setVideos(res.data);
      } catch (e) {
        console.error("Fetch videos error:", e);
      }
    };

    if (groupId) {
      fetchGroup();
      fetchHomeworks();
      fetchVideos();
    }
  }, [groupId]);

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      group_id: groupId,
      lesson_id: formData.get("lesson_id"),
      title: formData.get("title"),
    };
    try {
      await axios.post(`${BASE}/homework`, payload, { headers });
      setShowAddHomework(false);
      // Refresh list
      const res = await axios.get(`${BASE}/homework/group/${groupId}`, { headers });
      setHomeworks(res.data);
    } catch (err) {
      console.error("Create homework error:", err);
    }
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      group_id: groupId,
      topic: formData.get("topic"),
      description: formData.get("description"),
    };
    try {
      await axios.post(`${BASE}/lessons`, payload, { headers });
      setOpenAddVideo(false);
      // Refresh list
      const res = await axios.get(`${BASE}/lessons/group/${groupId}`, { headers });
      setVideos(res.data);
    } catch (err) {
      console.error("Create video error:", err);
    }
  };

  if (loading) return <Box sx={{ p: 3 }}>Yuklanmoqda...</Box>;
  if (!group) return <Box sx={{ p: 3 }}>Guruh topilmadi.</Box>;

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100%", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={onBack} size="small" sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
            {group.name}
          </Typography>
          <Chip
            label={group.status?.toUpperCase()}
            size="small"
            sx={{
              bgcolor: group.status === "active" ? "#dcfce7" : "#f1f5f9",
              color: group.status === "active" ? "#16a34a" : "#64748b",
              fontWeight: 700,
              fontSize: 10,
              height: 20,
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<QueryStatsIcon />}
          sx={{
            textTransform: "none",
            color: "#64748b",
            borderColor: "#e2e8f0",
            bgcolor: "white",
            fontSize: 13,
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          Statistika
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 3, borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        {["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"].map((t) => (
          <Box
            key={t}
            onClick={() => {
                setTab(t.toLowerCase());
                setShowAddHomework(false);
                setSelectedHomework(null);
            }}
            sx={{
              pb: 1.5,
              fontSize: 14,
              fontWeight: tab === t.toLowerCase() ? 600 : 400,
              color: tab === t.toLowerCase() ? "#10b981" : "#64748b",
              borderBottom: tab === t.toLowerCase() ? "2px solid #10b981" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t}
          </Box>
        ))}
      </Box>

      {/* Content */}
      {tab === "ma'lumotlar" && (
        <Grid container spacing={3}>
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            {/* Guruh mentorlari */}
            <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", mb: 3, overflow: "hidden", width: "650px" }}>
              <Box sx={{ bgcolor: "#2563eb", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: "white", fontWeight: 600, fontSize: 15 }}>Guruh mentorlari</Typography>
                <IconButton size="small" sx={{ color: "white" }}><CloseIcon fontSize="inherit" /></IconButton>
              </Box>
              <Box sx={{ p: 3, display: "flex", gap: 4 }}>
                {/* Main Teacher */}
                <Box sx={{ textAlign: "center" }}>
                  <Avatar sx={{ width: 48, height: 48, margin: "0 auto 8px", bgcolor: "#dcfce7", color: "#16a34a" }}>
                    {group.users?.photo ? <img src={group.users.photo} alt="" style={{width: '100%'}} /> : <Typography sx={{fontSize: 20}}>👤</Typography>}
                  </Avatar>
                  <Typography sx={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Teacher</Typography>
                  <Typography sx={{ color: "#1e293b", fontSize: 13, fontWeight: 600 }}>
                    {group.users?.first_name} {group.users?.last_name}
                  </Typography>
                </Box>
                {/* Assistant */}
                <Box sx={{ textAlign: "center" }}>
                  <Avatar sx={{ width: 48, height: 48, margin: "0 auto 8px", bgcolor: "#f1f5f9", color: "#64748b" }}>
                    <Typography sx={{fontSize: 20}}>👤</Typography>
                  </Avatar>
                  <Typography sx={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Assistant</Typography>
                  <Typography sx={{ color: "#1e293b", fontSize: 13, fontWeight: 600 }}>Umarxon +++Xodjaev</Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Avatar sx={{ width: 48, height: 48, margin: "0 auto 8px", bgcolor: "#f1f5f9", color: "#64748b" }}>
                    <Typography sx={{fontSize: 20}}>👤</Typography>
                  </Avatar>
                  <Typography sx={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Assistant</Typography>
                  <Typography sx={{ color: "#1e293b", fontSize: 13, fontWeight: 600 }}>Barchinoy +++Yusupova</Typography>
                </Box>
              </Box>
            </Card>

            {/* Akademiklar */}
            <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 600, color: "#1e293b", fontSize: 15 }}>
                Akademiklar va ularning o'qitgan soatlari
              </Typography>
              <IconButton size="small" sx={{ bgcolor: "#f8fafc" }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Card>
          </Grid>

          {/* Right Side - Parametrlar */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", overflow: "hidden", width : "650px" }}>
              <Box sx={{ bgcolor: "#2563eb", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: "white", fontWeight: 600, fontSize: 15 }}>Parametrlar</Typography>
                <IconButton size="small" sx={{ color: "white" }}><CloseIcon fontSize="inherit" /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                {[
                  { label: "Filial:", value: "Chilonzor", color: "#3b82f6" },
                  { label: "Kurs:", value: group.courses?.name },
                  { label: "Turi:", value: "BOOTCAMP" },
                  { label: "Kategoriya:", value: "Programming" },
                  { label: "To'lov turi:", value: "T|Bootcamp Fullstack|oyma-oy|03/07/2025", fontSize: 11 },
                  { label: "O'rta yosh:", value: "25" },
                  { label: "O'quvchilar sig'imi:", value: group.rooms?.capacity || group.max_student },
                  { label: "Mavjud o'quvchilar:", value: group.studentGroups?.length || 0 },
                  { label: "Shartnomalar:", value: "18" },
                  { label: "O'quv oyidagi darslar soni:", value: "20" },
                  { label: "Kurs davomiyligi (oy):", value: group.courses?.duration_month || "8.0" },
                  { label: "Jami darslar soni:", value: "160" },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.8 }}>
                    <Typography sx={{ color: "#64748b", fontSize: 12.5 }}>{item.label}</Typography>
                    <Typography sx={{ 
                      color: item.color || "#1e293b", 
                      fontSize: item.fontSize || 12.5, 
                      fontWeight: 600,
                      textAlign: "right",
                      maxWidth: "60%"
                    }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === "guruh darsliklari" && !showAddHomework && !selectedHomework && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", gap: 1, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "10px" }}>
              {["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"].map((st) => (
                <Button
                  key={st}
                  onClick={() => setSubTab(st.toLowerCase())}
                  sx={{
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    borderRadius: "8px",
                    bgcolor: subTab === st.toLowerCase() ? "white" : "transparent",
                    color: subTab === st.toLowerCase() ? "#1e293b" : "#64748b",
                    fontWeight: 600,
                    boxShadow: subTab === st.toLowerCase() ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    "&:hover": { bgcolor: subTab === st.toLowerCase() ? "white" : "#e2e8f0" },
                  }}
                >
                  {st}
                </Button>
              ))}
            </Box>
            <Button
              variant="contained"
              onClick={() => subTab === "videolar" ? setOpenAddVideo(true) : setShowAddHomework(true)}
              sx={{
                bgcolor: "#10b981",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              {subTab === "videolar" ? "Qo'shish" : "Uyga vazifa qo'shish"}
            </Button>
          </Box>

          {subTab === "videolar" ? (
            <TableContainer sx={{ bgcolor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { color: "#64748b", fontSize: 12, fontWeight: 600, py: 1.5 } }}>
                    <TableCell>Video nomi</TableCell>
                    <TableCell>Dars nomi</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Dars sanasi</TableCell>
                    <TableCell>Hajmi</TableCell>
                    <TableCell>Qo'shilgan vaqti</TableCell>
                    <TableCell align="right">Harakatlar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {videos.map((row) => (
                    <TableRow key={row.id} sx={{ "& td": { color: "#1e293b", fontSize: 13, py: 2 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover": { color: "#10b981" } }} onClick={() => setPlayingVideo(row)}>
                          <PlayCircleOutlinedIcon sx={{ color: "#10b981", fontSize: 20 }} />
                          <Typography sx={{ fontSize: 13, fontWeight: 500, textDecoration: "underline" }}>{row.topic}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.topic}</TableCell>
                      <TableCell><Chip label={row.status} size="small" sx={{ bgcolor: "#f0fdf4", color: "#10b981", fontWeight: 600, fontSize: 11, height: 20 }} /></TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>0 MB</TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
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
                      <TableCell 
                        onClick={() => setSelectedHomework(row)}
                        sx={{ fontWeight: 500, maxWidth: 300, cursor: "pointer", "&:hover": { color: "#10b981" } }}
                      >
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
          )}
        </Box>
      )}

      {/* Video Player Modal */}
      <Dialog open={!!playingVideo} onClose={() => setPlayingVideo(null)} maxWidth="md" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: "12px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{playingVideo?.lesson}</Typography>
          <IconButton onClick={() => setPlayingVideo(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#000", position: "relative", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ position: "absolute", top: 15, left: 15, color: "white", display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{playingVideo?.name}</Typography>
          </Box>
          <Box sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <PlayArrowIcon sx={{ color: "white", fontSize: 40 }} />
          </Box>
          {/* Mockup video bg */}
          <Box sx={{ width: "100%", height: "100%", position: "absolute", zIndex: -1 }}>
             <img src="/placeholder_ui.png" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} alt="" />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add Video Modal */}
      <Dialog 
        open={openAddVideo} 
        onClose={() => setOpenAddVideo(false)} 
        maxWidth="md" 
        fullWidth 
        sx={{ "& .MuiPaper-root": { borderRadius: "12px" } }}
        PaperProps={{ component: 'form', onSubmit: handleCreateVideo }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Qo'shish</Typography>
          <IconButton onClick={() => setOpenAddVideo(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ border: "2px dashed #10b981", borderRadius: "12px", p: 4, textAlign: "center", bgcolor: "#f0fdf4", mb: 3 }}>
            <FolderOpenOutlinedIcon sx={{ color: "#10b981", fontSize: 40, mb: 1 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#1e293b", mb: 0.5 }}>
              Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#64748b" }}>
              Videofayl .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov, .mpg formatlaridan birida bo'lishi kerak
            </Typography>
          </Box>

          <Table size="small">
             <TableHead>
               <TableRow sx={{ "& th": { color: "#64748b", fontSize: 12, fontWeight: 600, borderBottom: "none" } }}>
                 <TableCell>File name</TableCell>
                 <TableCell><Typography sx={{ display: 'inline', color: 'red' }}>* </Typography>Dars</TableCell>
                 <TableCell><Typography sx={{ display: 'inline', color: 'red' }}>* </Typography>Video nomi</TableCell>
                 <TableCell align="right">Actions</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               <TableRow>
                 <TableCell sx={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>108.2.mov</TableCell>
                 <TableCell>
                   <MuiSelect fullWidth size="small" displayEmpty defaultValue="" sx={{ borderRadius: "8px", height: 36, fontSize: 13 }}>
                     <MuiMenuItem value="" disabled>Darsni tanlang</MuiMenuItem>
                     <MuiMenuItem value="1">108-dars</MuiMenuItem>
                   </MuiSelect>
                 </TableCell>
                 <TableCell>
                   <MuiTextField fullWidth size="small" name="topic" defaultValue="108.2.mov" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", height: 36, fontSize: 13 } }} />
                 </TableCell>
                 <TableCell align="right">
                   <IconButton size="small" color="error"><DeleteOutlinedIcon /></IconButton>
                 </TableCell>
               </TableRow>
             </TableBody>
          </Table>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={() => setOpenAddVideo(false)} sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0" }}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#10b981", textTransform: "none", borderRadius: "8px", px: 4, "&:hover": { bgcolor: "#059669" } }}>
              Fayllarni yuklash
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {tab === "guruh darsliklari" && selectedHomework && (
        <HomeworkDetail 
          homework={selectedHomework} 
          onBack={() => setSelectedHomework(null)} 
        />
      )}

      {tab === "guruh darsliklari" && showAddHomework && (
        <Box component="form" onSubmit={handleCreateHomework} sx={{ bgcolor: "white", p: 3, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
            <IconButton onClick={() => setShowAddHomework(false)} size="small">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Yangi uyga vazifa yaratish
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                Vazifa mavzusi <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <MuiTextField 
                fullWidth 
                name="title"
                placeholder="Vazifa mavzusini kiriting" 
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fcfdff" } }} 
              />

              <Typography sx={{ fontWeight: 600, mb: 1, mt: 3, fontSize: 14 }}>Darsni tanlang</Typography>
              <MuiSelect 
                fullWidth 
                name="lesson_id"
                displayEmpty 
                defaultValue="" 
                sx={{ borderRadius: "10px", bgcolor: "#fcfdff" }}
              >
                <MuiMenuItem value="" disabled>Darsni tanlang</MuiMenuItem>
                {videos.map(v => (
                  <MuiMenuItem key={v.id} value={v.id}>{v.topic}</MuiMenuItem>
                ))}
              </MuiSelect>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowAddHomework(false)}
                  sx={{ textTransform: "none", borderRadius: "8px", color: "#64748b", borderColor: "#e2e8f0" }}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: "#10b981", textTransform: "none", borderRadius: "8px", px: 4, fontWeight: 600, "&:hover": { bgcolor: "#059669" } }}
                >
                  E'lon qilish
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
