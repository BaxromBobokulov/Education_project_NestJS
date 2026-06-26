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
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNotify } from "./NotificationContext";

const BASE = "http://localhost:3000";

export default function GroupAttendance({ group, onlyCalendar = false, initialSelectedDay = null, onSelectDate, onBack }) {
  const notify = useNotify();
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  const [selectedDay, setSelectedDay] = useState(initialSelectedDay || todayISO);
  const [topic, setTopic] = useState("CRM groupinner full");
  const [sourceType, setSourceType] = useState("boshqa");
  const [params, setParams] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [lessonsHistory, setLessonsHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [showAllMonths, setShowAllMonths] = useState(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Sync selected day with initialSelectedDay if it changes
  useEffect(() => {
    if (initialSelectedDay) {
      setSelectedDay(initialSelectedDay);
    }
  }, [initialSelectedDay]);

  // Fetch parameters and schedule
  useEffect(() => {
    if (!group?.id) return;
    setLoadingParams(true);
    setLoadingSchedule(true);

    axios.get(`${BASE}/groups/${group.id}/parameters`, { headers })
      .then((res) => setParams(res.data))
      .catch((err) => console.error("Parameters fetch error:", err))
      .finally(() => setLoadingParams(false));

    axios.get(`${BASE}/groups/${group.id}/schedule`, { headers })
      .then((res) => {
        setSchedule(res.data);
        // Find current month index in schedule
        const initialCurrentIndex = res.data.findIndex(row => {
          if (!row?.start_date || !row?.end_date) return false;
          return todayISO >= row.start_date && todayISO <= row.end_date;
        });
        setActiveMonthIndex(initialCurrentIndex >= 0 ? initialCurrentIndex : 0);
      })
      .catch((err) => console.error("Schedule fetch error:", err))
      .finally(() => setLoadingSchedule(false));

    axios.get(`${BASE}/groups/${group.id}/attendance-history`, { headers })
      .then((res) => setLessonsHistory(res.data))
      .catch((err) => console.error("Failed to fetch attendance history:", err));
  }, [group?.id]);

  // Fetch active students
  useEffect(() => {
    if (!group?.id || onlyCalendar) return;
    setLoadingStudents(true);
    axios.get(`${BASE}/groups/${group.id}/students`, { headers })
      .then((res) => {
        const list = res.data?.students || [];
        setStudents(list);
        const init = {};
        list.forEach((s) => {
          init[s.id] = false;
        });
        setAttendance(init);
      })
      .catch((err) => console.error("Students fetch error:", err))
      .finally(() => setLoadingStudents(false));
  }, [group?.id, onlyCalendar]);

  // Fetch existing attendance for selected day
  useEffect(() => {
    if (!group?.id || !selectedDay || onlyCalendar || students.length === 0) return;
    setHasExistingAttendance(false);
    axios.get(`${BASE}/attendance/group/${group.id}/date/${selectedDay}`, { headers })
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
          const init = {};
          students.forEach((s) => {
            init[s.id] = false;
          });
          setAttendance(init);
          setTopic("");
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          console.error("Attendance fetch error:", err);
        }
        const init = {};
        students.forEach((s) => {
          init[s.id] = false;
        });
        setAttendance(init);
        setTopic("");
      });
  }, [group?.id, selectedDay, students.length, onlyCalendar]);

  const handleToggleAttendance = (id) => {
    if (selectedDay !== todayISO || hasExistingAttendance) return;
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveAttendance = async () => {
    if (!group?.id) return;
    if (selectedDay !== todayISO || hasExistingAttendance) return;
    if (!topic.trim()) {
      notify("Mavzuni kiriting!", "warning");
      return;
    }
    const activeStudents = students.filter((s) => s.status === "active");
    if (activeStudents.length === 0) {
      notify("Guruhda faol o'quvchilar mavjud emas!", "warning");
      return;
    }

    setSavingAttendance(true);
    try {
      const payload = {
        group_id: group.id,
        date: selectedDay,
        topic: topic,
        description: "",
        students: activeStudents.map((s) => ({
          student_id: s.id,
          isPresent: !!attendance[s.id],
        })),
      };

      await axios.post(`${BASE}/attendance`, payload, { headers });
      notify("Davomat muvaffaqiyatli saqlandi!", "success");
      setHasExistingAttendance(true);
      // Refresh attendance history to update indicators
      axios.get(`${BASE}/groups/${group.id}/attendance-history`, { headers })
        .then((res) => setLessonsHistory(res.data))
        .catch((err) => console.error(err));
      
      if (onBack) onBack();
    } catch (err) {
      console.error("Save attendance error:", err);
      const msg = err?.response?.data?.message || "Davomatni saqlashda xatolik";
      notify(typeof msg === "string" ? msg : JSON.stringify(msg), "error");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Calendar calculations
  const monthShort = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const buildMonthDays = (row) => {
    if (!row) return [];
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

  const currentMonthSchedule = schedule[activeMonthIndex] || schedule[0];
  const activeMonthSchedule = schedule[activeMonthIndex] || currentMonthSchedule;
  const activeMonthDays = buildMonthDays(activeMonthSchedule);
  const allMonthDays = schedule.map(row => ({
    row,
    days: buildMonthDays(row)
  }));

  return (
    <Box>
      {onBack && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={onBack}
            sx={{
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              mr: 2,
              width: 40,
              height: 40,
              color: "#1e293b",
              "&:hover": { bgcolor: "#f1f5f9" }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Dars tafsilotlari
          </Typography>
        </Box>
      )}

      {/* Dars Jadvali va Kalendar Slayderi */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", p: 3, bgcolor: "white", width: "1120px" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#475569", mb: 2 }}>
            {onBack ? "O'quv oyi kunlari" : "Dars jadvali"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
            {loadingSchedule ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : currentMonthSchedule ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#f8fafc", p: 1.8, borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <Typography sx={{ color: "#3b82f6", fontWeight: 600, fontSize: 13, flex: 1.2 }}>{currentMonthSchedule.name}</Typography>
                <Typography sx={{ color: "#475569", fontSize: 13, flex: 1 }}>{currentMonthSchedule.days}</Typography>
                <Typography sx={{ color: "#1e293b", fontWeight: 600, fontSize: 13, flex: 1.2 }}>{currentMonthSchedule.time}</Typography>
                <Typography sx={{ color: "#64748b", fontSize: 13, flex: 1.5 }}>{currentMonthSchedule.range}</Typography>
                <Typography sx={{ color: "#1e293b", fontSize: 13, fontWeight: 500, textAlign: "right", flex: 1 }}>{currentMonthSchedule.room}</Typography>
              </Box>
            ) : (
              <Typography sx={{ color: "#64748b", fontSize: 13, textAlign: "center", mt: 2 }}>Jadval topilmadi</Typography>
            )}
          </Box>

          <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {(showAllMonths ? allMonthDays : [{ row: activeMonthSchedule, days: activeMonthDays }]).map(({ row, days }, idx) => (
              <Box key={row?.month_number || idx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                    {row?.month_label || `${idx + 1}-o'quv oyi`}
                  </Typography>
                  {!showAllMonths && (
                    <IconButton
                      size="small"
                      onClick={() => setActiveMonthIndex(Math.max(0, activeMonthIndex - 1))}
                      disabled={activeMonthIndex === 0}
                      sx={{ border: "1px solid #e2e8f0", p: 0.3 }}
                    >
                      <ChevronLeftIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                  {!showAllMonths && (
                    <IconButton
                      size="small"
                      onClick={() => setActiveMonthIndex(Math.min(schedule.length - 1, activeMonthIndex + 1))}
                      disabled={activeMonthIndex >= schedule.length - 1}
                      sx={{ border: "1px solid #e2e8f0", p: 0.3 }}
                    >
                      <ChevronRightIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1.5, pt: 0.5 }}>
                  {days && days.length > 0 ? (
                    days.map((d, i) => {
                      const isToday = d.isToday;
                      const isSelected = selectedDay === d.fullDate;
                      return (
                        <Box
                          key={i}
                          onClick={() => {
                            setSelectedDay(d.fullDate);
                            if (onSelectDate) {
                              onSelectDate(d.fullDate);
                            }
                          }}
                          sx={{
                            minWidth: 52,
                            textAlign: "center",
                            py: 1.2,
                            px: 0.5,
                            borderRadius: "8px",
                            cursor: "pointer",
                            bgcolor: isSelected ? "#3b82f6" : isToday ? "#e2e8f0" : "white",
                            border: isToday ? "1px solid #94a3b8" : "1px solid #e2e8f0",
                            color: isSelected ? "white" : "#475569",
                            transition: "all 0.15s",
                            position: "relative",
                            "&:hover": { borderColor: "#a78bfa" }
                          }}
                        >
                          <Typography sx={{ fontSize: 9, color: isSelected ? "white" : "#94a3b8", fontWeight: 500, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {d.month}
                          </Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                            {d.date}
                          </Typography>
                          {d.isLessonDay && (
                            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#f59e0b", position: "absolute", top: 4, right: 4 }} />
                          )}
                        </Box>
                      );
                    })
                  ) : (
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Bu oy uchun dars sanalari topilmadi</Typography>
                  )}
                </Box>
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, pr: 1 }}>
              <Button
                onClick={() => setShowAllMonths(!showAllMonths)}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none", color: "#1e293b", borderColor: "#cbd5e1",
                  borderRadius: "8px", fontSize: 13, px: 3, py: 0.6, fontWeight: 500,
                  "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" }
                }}
              >
                {showAllMonths ? "Berkitish" : "Barchasini ko'rish"}
              </Button>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Attendance Inline Panel (only shown when onlyCalendar is false and selectedDay is selected) */}
      {!onlyCalendar && selectedDay && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Card sx={{ p: 4, borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "none", bgcolor: "white", width: "1120px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
                Yo'qlama va mavzu kiritish ({selectedDay})
              </Typography>
              {onBack && (
                <IconButton onClick={onBack} size="small" sx={{ bgcolor: "#f1f5f9" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {selectedDay !== todayISO ? (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: "8px", bgcolor: "#fee2e2", color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
                O'tib ketgan yoki kelajak kunlar uchun davomat qilish taqiqlanadi. Faqat bugungi kun uchun davomat qilinishi mumkin.
              </Box>
            ) : hasExistingAttendance ? (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: "8px", bgcolor: "#fef3c7", color: "#92400e", fontSize: 13, fontWeight: 600 }}>
                Ushbu kun uchun yo'qlama allaqachon bajarilgan va uni o'zgartirib bo'lmaydi.
              </Box>
            ) : null}

            <RadioGroup row value={sourceType} onChange={(e) => setSourceType(e.target.value)} sx={{ mb: 3 }}>
              <FormControlLabel value="plan" control={<Radio size="small" sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} disabled />} label={<Typography sx={{ fontSize: 13, color: "#94a3b8" }}>O'quv reja bo'yicha</Typography>} />
              <FormControlLabel value="boshqa" control={<Radio size="small" sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} />} label={<Typography sx={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Boshqa</Typography>} />
            </RadioGroup>

            <Box sx={{ mb: 4, maxWidth: "400px" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1 }}>
                * Mavzu
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={selectedDay !== todayISO || hasExistingAttendance}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, bgcolor: "#f8fafc" } }}
              />
            </Box>

            <Box sx={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", width: "100%", mb: 3 }}>
              <Box sx={{ display: "flex", bgcolor: "#f8fafc", px: 3, py: 1.5, borderBottom: "1px solid #e2e8f0" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: "60px" }}>#</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", flex: 1 }}>O'quvchi ismi</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: "100px" }}>Vaqti</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: "100px", textAlign: "right" }}>Keldi</Typography>
              </Box>

              {loadingStudents ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : students.filter(s => s.status === 'active').length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>Bu guruhda faol o'quvchilar mavjud emas</Typography>
                </Box>
              ) : students.filter(s => s.status === 'active').map((st, i) => (
                <Box key={st.id} sx={{ display: "flex", alignItems: "center", px: 3, py: 1.8, borderBottom: i !== students.filter(s => s.status === 'active').length - 1 ? "1px solid #f1f5f9" : "none", bgcolor: !!attendance[st.id] ? "#f0fdf4" : "transparent" }}>
                  <Typography sx={{ fontSize: 13, color: "#475569", width: "60px" }}>{i + 1}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                    <Avatar
                      src={st.photo ? `${BASE}/user/image/${st.photo}` : undefined}
                      sx={{ width: 32, height: 32, bgcolor: "#ede9fe", color: "#7c3aed", fontSize: 13, fontWeight: 700 }}
                    >
                      {!st.photo && st.first_name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                      {st.last_name} {st.first_name}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "#475569", width: "100px" }}>
                    {group?.start_time || "09:30"}
                  </Typography>
                  <Box sx={{ width: "100px", textAlign: "right" }}>
                    <Switch
                      size="small"
                      checked={!!attendance[st.id]}
                      onChange={() => handleToggleAttendance(st.id)}
                      disabled={selectedDay !== todayISO || hasExistingAttendance}
                      color="success"
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSaveAttendance}
                disabled={savingAttendance || students.filter(s => s.status === 'active').length === 0 || selectedDay !== todayISO || hasExistingAttendance}
                sx={{
                  bgcolor: "#10b981", px: 5, py: 1.2, borderRadius: "8px", textTransform: "none", fontWeight: 600,
                  "&:hover": { bgcolor: "#059669" },
                  "&:disabled": { bgcolor: "#a7f3d0" }
                }}
              >
                {savingAttendance ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </Box>
          </Card>
        </Grid>
      )}
    </Box>
  );
}
