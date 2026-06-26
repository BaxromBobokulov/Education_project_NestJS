import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";

const BASE = "http://localhost:3000";

// Sub-component for individual student row to handle its own expanded state
function StudentRow({ student, activeMonthDays, lessonsHistory, activeMonthLabel }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Statusga qarab ranglarni qaytaruvchi yordamchi funksiya
  const getDateBoxStyles = (status) => {
    switch (status) {
      case "gray":
        return { bgcolor: "#E5E7EB", border: "1px solid #E5E7EB" }; // Kulrang fon (kelgan)
      case "yellow":
        return { bgcolor: "#FEF3C7", border: "1px solid #FDE68A" }; // Sariq/Och sariq fon (kelmagan)
      case "white":
      default:
        return { bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }; // Oq fon (dars bo'lmagan / hali kelmagan)
    }
  };

  // Student darsda qatnashganligini aniqlash funksiyasi
  const getStudentStatusForDay = (studentId, fullDate) => {
    if (!lessonsHistory || lessonsHistory.length === 0) return "white";

    const lessonOnDay = lessonsHistory.find((l) => {
      const lessonDateStr = new Date(l.created_at).toISOString().split("T")[0];
      return lessonDateStr === fullDate;
    });

    if (!lessonOnDay) return "white";

    const attendanceRecord = lessonOnDay.attendances?.find(
      (a) => a.student_id === studentId
    );
    if (!attendanceRecord) return "white";

    return attendanceRecord.isPresent ? "gray" : "yellow";
  };

  return (
    <Box
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      {/* O'quvchilar qatori (Header) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#F8FAFC", // Och kulrang-ko'k fon
          px: 3,
          py: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: "#F1F5F9" },
        }}
        onClick={toggleExpand}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={student.photo ? `${BASE}/user/image/${student.photo}` : undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#E2E8F0",
              color: "#64748B",
            }}
          >
            {!student.photo && <PersonIcon />}
          </Avatar>
          <Typography sx={{ fontWeight: 500, color: "#111827", fontSize: 16 }}>
            {student.full_name}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: "#111827" }}>
          {expanded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Box>

      {/* Ochiq holatdagi kalendar qismi */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ bgcolor: "#FFFFFF", p: 3 }}>
          {/* O'quv oyi sarlavhasi */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography sx={{ color: "#374151", fontSize: 15 }}>
              {activeMonthLabel}
            </Typography>
            <IconButton
              size="small"
              sx={{
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                padding: "2px",
              }}
            >
              <ChevronRightIcon fontSize="small" sx={{ color: "#6B7280" }} />
            </IconButton>
          </Box>

          {/* Sanalar qatori */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
            {activeMonthDays.map((date, index) => {
              const status = getStudentStatusForDay(student.id, date.fullDate);
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 52,
                    borderRadius: 2,
                    ...getDateBoxStyles(status),
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#6B7280", lineHeight: 1.2 }}>
                    {date.month}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                    {date.date}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function StudentsList({ group, students, activeMonthDays, activeMonthLabel, lessonsHistory = [] }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const activeStudents = students.filter((s) => s.status === "active");
  const inactiveStudents = students.filter((s) => s.status !== "active");
  const currentStudentsList = tabValue === 0 ? activeStudents : inactiveStudents;

  return (
    <Box sx={{ width: "100%", p: 3, fontFamily: "sans-serif", bgcolor: "#FFFFFF", width: "1118px",         border: "1px solid #E5E7EB",
        borderRadius: 2, }}>
      {/* 1. Header qismi: Sarlavha va Menu tugmasi */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 600, color: "#111827" }}>
          O'quvchilar
        </Typography>
        <Button
          variant="outlined"
          startIcon={<MenuIcon />}
          sx={{
            color: "#4B5563",
            borderColor: "#D1D5DB",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          Menu
        </Button>
      </Box>

      {/* 2. Tabs (Faollar va Darssiz) */}
      <Box sx={{ borderBottom: 1, borderColor: "#E5E7EB", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            minHeight: "auto",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: 16,
              minWidth: "auto",
              mr: 4,
              p: 0,
              pb: 1.5,
              color: "#6B7280",
            },
            "& .Mui-selected": {
              color: "#10B981 !important", // Yashil rang
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#10B981",
              height: 2,
            },
          }}
        >
          <Tab label={`Faollar (${activeStudents.length})`} />
          <Tab label={`Darssiz (${inactiveStudents.length})`} />
        </Tabs>
      </Box>

      {/* 3. O'quvchilar ro'yxati */}
      {currentStudentsList.length === 0 ? (
        <Typography sx={{ color: "#6B7280", fontSize: 14, py: 3, textAlign: "center" }}>
          O'quvchilar mavjud emas
        </Typography>
      ) : (
        currentStudentsList.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            activeMonthDays={activeMonthDays}
            lessonsHistory={lessonsHistory}
            activeMonthLabel={activeMonthLabel}
          />
        ))
      )}
    </Box>
  );
}
