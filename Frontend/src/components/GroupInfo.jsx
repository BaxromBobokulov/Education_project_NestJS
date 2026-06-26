import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  Grid,
  Avatar,
  IconButton,
  Button,
  Switch,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import PersonIcon from "@mui/icons-material/Person";
import StudentsList from "./StudentsList";
import GroupAttendance from "./GroupAttendance";

const BASE = "http://localhost:3000";

export default function GroupInfo({ group, onSelectDate }) {
  // Hozirgi sanani topamiz
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  const [selectedDay, setSelectedDay] = useState(todayISO);
  const [activeRole, setActiveRole] = useState("teacher");
  const [topic, setTopic] = useState("CRM groupinner full");
  const [sourceType, setSourceType] = useState("boshqa");
  const [params, setParams] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [lessonsHistory, setLessonsHistory] = useState([]);

  const fetchAttendanceHistory = () => {
    if (group?.id) {
      const token = localStorage.getItem("token");
      axios
        .get(`${BASE}/groups/${group.id}/attendance-history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setLessonsHistory(res.data))
        .catch((err) => console.error("Failed to fetch attendance history:", err));
    }
  };
  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Fetch parameters and schedule from backend
  useEffect(() => {
    if (!group?.id) return;
    setLoadingParams(true);
    setLoadingSchedule(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${BASE}/groups/${group.id}/parameters`, { headers })
      .then((res) => {
        setParams(res.data);
      })
      .catch((err) => console.error("Parameters fetch error:", err))
      .finally(() => setLoadingParams(false));

    axios.get(`${BASE}/groups/${group.id}/schedule`, { headers })
      .then((res) => {
        setSchedule(res.data);
      })
      .catch((err) => console.error("Schedule fetch error:", err))
      .finally(() => setLoadingSchedule(false));
  }, [group?.id]);
  // const [students, setStudents] = useState([]);

  // Barchasini ko'rish - inline expand rejimi
  const [showAllMonths, setShowAllMonths] = useState(false);
  // Hozirgi ko'rinayotgan oy indexi (schedule ichidagi)
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);

  // Schedule mavjud bo'lganda, "hozirgi oy" ni avtomatik aniqlaymiz
  // (today shu oy ichida bo'lgan row, aks holda 0-indeks)
  const initialCurrentIndex = schedule.findIndex(row => {
    if (!row?.start_date || !row?.end_date) return false;
    return todayISO >= row.start_date && todayISO <= row.end_date;
  });
  const currentMonthIndex = initialCurrentIndex >= 0 ? initialCurrentIndex : 0;
  const currentMonthSchedule = schedule[currentMonthIndex] || schedule[0];

  // Aktiv oy (o'quvchi < > tugmalari orqali boshqariladi)
  const activeMonthSchedule = schedule[activeMonthIndex] || currentMonthSchedule;

  // Oy nomlari
  const monthShort = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

  // Hozirgi aktiv oy uchun sanalar va lesson_day aniqlash
  // Backend `lesson_dates` massivini ishlatamiz (faqat dars kunlari)
  const buildMonthDays = (row) => {
    if (!row) return [];
    // Agar backend lesson_dates qaytargan bo'lsa, undan foydalanamiz
    if (row.lesson_dates && Array.isArray(row.lesson_dates) && row.lesson_dates.length > 0) {
      return row.lesson_dates.map(d => {
        const dt = new Date(d);
        return {
          date: String(dt.getDate()).padStart(2, "0"),
          month: monthShort[dt.getMonth()],
          fullDate: d,
          isToday: d === todayISO,
          isPast: dt < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          isLessonDay: true
        };
      });
    }
    // Aks holda, oyning barcha kunlarini generatsiya qilib, week_day ga qarab filterlaymiz
    const weekDayArr = (params?.week_day && Array.isArray(params.week_day)) ? params.week_day : [];
    if (row.start_date && row.end_date) {
      const out = [];
      const cursor = new Date(row.start_date);
      const end = new Date(row.end_date);
      while (cursor <= end) {
        const dayKey = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][cursor.getDay()];
        const isLesson = weekDayArr.length === 0 || weekDayArr.includes(dayKey);
        if (isLesson) {
          const iso = cursor.toISOString().split("T")[0];
          out.push({
            date: String(cursor.getDate()).padStart(2, "0"),
            month: monthShort[cursor.getMonth()],
            fullDate: iso,
            isToday: iso === todayISO,
            isPast: cursor < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            isLessonDay: true
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      return out;
    }
    return [];
  };

  // Aktiv oy uchun kunlar ro'yxati
  const activeMonthDays = buildMonthDays(activeMonthSchedule);

  // Barcha oylar uchun kunlar
  const allMonthDays = schedule.map(row => ({
    row,
    days: buildMonthDays(row)
  }));

  // [studentId]: boolean — o'quvchilarning davomati (default: false)
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState(null); // { type, 'success'|'error', text }
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  // Guruh va parametrlarni yuklash
  useEffect(() => {
    if (group?.id) {
      setLoadingParams(true);
      setLoadingSchedule(true);
      const token = localStorage.getItem("token");

      axios.get(`${BASE}/groups/${group.id}/parameters`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setParams(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingParams(false));

      axios.get(`${BASE}/groups/${group.id}/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setSchedule(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingSchedule(false));

      fetchAttendanceHistory();
    }
  }, [group?.id]);

  // Guruhning faol o'quvchilarini yuklash
  useEffect(() => {
    if (!group?.id) return;
    setLoadingStudents(true);
    const token = localStorage.getItem("token");
    axios.get(`${BASE}/groups/${group.id}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const list = res.data?.students || [];
        setStudents(list);
        // Boshlang'ich holatda hammasi "keldi" emas (false)
        const init = {};
        list.forEach((s) => { init[s.id] = false; });
        setAttendance(init);
      })
      .catch((err) => console.error("Students fetch error:", err))
      .finally(() => setLoadingStudents(false));
  }, [group?.id]);

  // Tanlangan kun uchun mavjud davomatni yuklash va mavzuni olish
  useEffect(() => {
    if (!group?.id || !selectedDay) return;
    const token = localStorage.getItem("token");
    setLoadingAttendance(true);
    setHasExistingAttendance(false);
    axios.get(`${BASE}/attendance/group/${group.id}/date/${selectedDay}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const lessons = res.data?.lessons || [];
        if (lessons.length > 0) {
          setHasExistingAttendance(true);
          setTopic(lessons[0].topic || "");
          const map = {};
          (lessons[0].attendance || []).forEach((a) => {
            map[a.student_id] = a.isPresent;
          });
          setAttendance((prev) => ({ ...prev, ...map }));
        } else {
          // If no existing attendance, reset all students' attendance to false
          const init = {};
          students.forEach((s) => { init[s.id] = false; });
          setAttendance(init);
          setTopic("");
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          console.error("Attendance fetch error:", err);
        }
        // Fallback reset on error
        const init = {};
        students.forEach((s) => { init[s.id] = false; });
        setAttendance(init);
        setTopic("");
      })
      .finally(() => setLoadingAttendance(false));
  }, [group?.id, selectedDay, students.length]);

  const handleToggleAttendance = (id) => {
    if (selectedDay !== todayISO || hasExistingAttendance) return; // Disallow toggle if locked
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Saqlash - davomatni backend'ga yuborish
  const handleSaveAttendance = async () => {
    if (!group?.id) return;
    if (selectedDay !== todayISO || hasExistingAttendance) return;
    if (!topic.trim()) {
      setAttendanceMsg({ type: "error", text: "Mavzuni kiriting" });
      return;
    }
    const activeStudents = students.filter(s => s.status === 'active');
    if (activeStudents.length === 0) {
      setAttendanceMsg({ type: "error", text: "O'quvchilar mavjud emas" });
      return;
    }

    setSavingAttendance(true);
    setAttendanceMsg(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        group_id: group.id,
        date: selectedDay,
        topic: topic,
        description: "",
        students: activeStudents.map((s) => ({
          student_id: s.id,
          isPresent: !!attendance[s.id]
        }))
      };

      const res = await axios.post(`${BASE}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceMsg({
        type: "success",
        text: `Davomat saqlandi! Keldi: ${res.data.present_count}, Kelmadi: ${res.data.absent_count}`
      });
      setHasExistingAttendance(true); // Lock editing immediately after save
      fetchAttendanceHistory(); // Re-fetch attendance history to update the student list calendar
    } catch (err) {
      console.error("Save attendance error:", err);
      const msg = err?.response?.data?.message || "Davomatni saqlashda xatolik";
      setAttendanceMsg({ type: "error", text: typeof msg === "string" ? msg : JSON.stringify(msg) });
    } finally {
      setSavingAttendance(false);
    }
  };

  const parametersList = params ? [
    { label: "Filial:", value: params.branch, color: "#3b82f6" },
    { label: "Kurs:", value: params.course_name },
    { label: "Turi:", value: params.type },
    { label: "Kategoriya:", value: params.category },
    { label: "O'qituvchi:", value: params.teacher, color: "#10b981" },
    { label: "Kim tomonidan kiritilgan:", value: params.created_by, color: "#7c3aed" },
    { label: "To'lov turi:", value: params.payment_type },
    { label: "O'rta yosh:", value: params.average_age },
    { label: "O'quvchilar sig'imi:", value: params.capacity },
    { label: "Mavjud o'quvchilar:", value: params.current_students },
    { label: "Shartnomalar:", value: params.contracts },
    { label: "O'quv oyidagi darslar soni:", value: params.lessons_per_month },
    { label: "Kurs davomiyligi (oy):", value: params.course_duration_months },
    { label: "Jami darslar soni:", value: params.total_lessons },
  ] : [];

  return (
    <Grid container spacing={3}>
      {/* Guruh Mentorlari */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", mb: 3, overflow: "hidden", width: "528px" }}>
          <Box sx={{ bgcolor: "#2563eb", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: 14 }}>Guruh mentorlari</Typography>
            <IconButton size="small" sx={{ color: "white" }}><CloseIcon fontSize="inherit" /></IconButton>
          </Box>
          <Box sx={{ p: 3, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {group?.teacherGroups?.length > 0 ? (
              group.teacherGroups.map((tg, idx) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <Avatar
                    src={tg.users.photo ? `http://localhost:3000/user/image/${tg.users.photo}` : undefined}
                    sx={{ width: 56, height: 56, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700, right: 0, left: "50%", transform: "translateX(-50%)", mb: 1.5 }}
                  >
                    {!tg.users.photo && tg.users.first_name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography sx={{ color: tg.users?.role === 'TEACHER' ? "#10b981" : "#64748b", fontSize: 11, fontWeight: 600 }}>
                    {tg.users?.role === 'TEACHER' ? 'Teacher' : 'Assistant'}
                  </Typography>
                  <Typography sx={{ color: "#1e293b", fontSize: 13, fontWeight: tg.users?.role === 'TEACHER' ? 700 : 600 }}>
                    {tg.users?.first_name} {tg.users?.last_name}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "#64748b", fontSize: 13 }}>Mentorlar biriktirilmagan</Typography>
            )}
          </Box>
        </Card>

        {/* Akademiklar */}
        <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
            Akademiklar va ularning o'qitgan soatlari
          </Typography>
          <IconButton size="small" sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Card>
      </Grid>

      {/* Parametrlar paneli */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", overflow: "hidden", width: "565px" }}>
          <Box sx={{ bgcolor: "#2563eb", p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: 14 }}>Parametrlar</Typography>
            <IconButton size="small" sx={{ color: "white" }}><CloseIcon fontSize="inherit" /></IconButton>
          </Box>
          <Box sx={{ p: 2, bgcolor: "white", minHeight: "350px", display: "flex", flexDirection: "column" }}>
            {loadingParams ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={30} />
              </Box>
            ) : params ? (
              parametersList.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: idx !== parametersList.length - 1 ? "1px solid #f8fafc" : "none" }}>
                  <Typography sx={{ color: "#64748b", fontSize: 13 }}>{item.label}</Typography>
                  <Typography sx={{ color: item.color || "#1e293b", fontSize: 13, fontWeight: 600, textAlign: "right" }}>
                    {item.value}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "#64748b", fontSize: 13, textAlign: "center", mt: 2 }}>Ma'lumot topilmadi</Typography>
            )}
          </Box>
        </Card>
      </Grid>

      <GroupAttendance
        group={group}
        onlyCalendar={true}
        onSelectDate={onSelectDate}
      />

      {/* Guruh O'quvchilari Ro'yxati */}
      <Grid item xs={12} sx={{ mt: 1 }}>
        <StudentsList
          group={group}
          students={students}
          activeMonthDays={activeMonthDays}
          activeMonthLabel={activeMonthSchedule?.month_label || "1-o'quv oyi"}
          lessonsHistory={lessonsHistory}
        />
      </Grid>
    </Grid>
  );
}
