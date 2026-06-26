import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    IconButton,
    Link,
    InputBase,
    Button,
    CircularProgress,
    Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ErrorIcon from "@mui/icons-material/Error";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNotify } from "../NotificationContext";
import axios from 'axios';

const BASE = "http://localhost:3000";

// Uzbek months list for date rendering
const uzMonths = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const formatUzbekDate = (dateString, showTimeFirst = true) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "";
    const day = dateObj.getDate();
    const month = uzMonths[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    if (showTimeFirst) {
        return `${hours}:${minutes} ${day} ${month}, ${year}`;
    } else {
        return `${day} ${month}, ${year} ${hours}:${minutes}`;
    }
};

const getFilesList = (fileStr) => {
    if (!fileStr) return [];
    return fileStr.split(',').map(f => f.trim()).filter(Boolean);
};

// ================= KOMPONENTLAR =================

// --- VIDEO QISMI ---
const VideoSection = ({ videoName, videoUrl }) => (
    <Box sx={{ mb: 4 }}>
        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#3D2C2A', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            {videoUrl ? (
                <video 
                    controls 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Brauzeringiz videoni qo'llab-quvvatlamaydi
                </video>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography sx={{ color: '#fff' }}>Video yuklanmagan</Typography>
                </Box>
            )}
        </Box>
        <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography sx={{ color: '#333', fontSize: 16, fontWeight: 500 }}>{videoName}</Typography>
        </Paper>
    </Box>
);

const NoVideoAvailable = () => (
    <Paper
        elevation={0}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280, // Qutining balandligi
            border: '1px solid #E5E7EB', // Atrofiga chiziq
            borderRadius: 2, // Burchaklarni yoylash
            bgcolor: '#FFFFFF', // Oq fon
            p: 4, // Padding
            mb: 4, // Pastdan joy tashlash (agar kerak bo'lsa)
        }}
    >
        {/* Logotip qismi */}
        <Box sx={{ mb: 2 }}>
            <svg 
                width="140" 
                height="90" 
                viewBox="0 0 100 60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Logotipni imitatsiya qiluvchi chiziqlar */}
                <path d="M15 25 L30 35 L50 55 L70 35 L85 25" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20 L30 25 M80 20 L70 25" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M25 15 L40 30 L50 40 L60 30 L75 15" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35 10 L50 25 L65 10" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 35 V20 L50 40 L70 20 V35" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 25 V15 L35 10 M85 25 V15 L65 10" stroke="#C17D49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </Box>

        {/* Matn qismi */}
        <Typography
            sx={{
                color: '#222222', // To'q rang
                fontWeight: 600, // Qalinroq shrift
                fontSize: '18px', // Matn o'lchami
                letterSpacing: '0.3px' // Harflar orasi biroz ochiqroq
            }}
        >
            Video mavjud emas
        </Typography>
    </Paper>
);

// --- 1. VAZIFA TAVSIFI ---
const HomeworkTask = ({ taskDesc, deadline, files = [], createdAt }) => {
    return (
        <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 17 }}>Uyga vazifa</Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    {deadline && (
                        <Box sx={{ bgcolor: '#FF3B30', color: '#fff', px: 1.5, py: 0.6, borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, fontWeight: 500 }}>
                            <ErrorIcon sx={{ fontSize: 16 }} />
                            Uyga vazifa muddati: {deadline}
                        </Box>
                    )}
                    <Typography sx={{ fontSize: 14, color: '#333', fontWeight: 500 }}>
                        Fayllar soni: {files.length}
                    </Typography>
                </Box>
            </Box>
            
            <Typography sx={{ fontSize: 15, color: '#444', mb: files.length > 0 ? 2 : 0, lineHeight: 1.6 }}>
                {taskDesc}
            </Typography>

            {/* Displaying files if any */}
            {files.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, mb: 2 }}>
                    {files.map((file, idx) => {
                        const fileName = file.split('/').pop() || 'file';
                        const fileUrl = file.startsWith('uploads/') 
                            ? `${BASE}/lessons/video/${file.replace('uploads/', '')}`
                            : file;
                        return (
                            <Box 
                                key={idx}
                                component="a"
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    p: 1.5, 
                                    bgcolor: '#fff', 
                                    borderRadius: 2, 
                                    border: '1px solid #E5E7EB',
                                    textDecoration: 'none',
                                    color: '#475569',
                                    minWidth: 220,
                                    maxWidth: 300,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: '#C17D49',
                                        boxShadow: '0 2px 8px rgba(193, 125, 73, 0.1)',
                                        color: '#C17D49'
                                    }
                                }}
                            >
                                <InsertDriveFileIcon sx={{ color: '#C17D49', fontSize: 20 }} />
                                <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                                    {fileName}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {createdAt && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Typography sx={{ fontSize: 13, color: '#777', fontWeight: 500 }}>
                        {formatUzbekDate(createdAt, true)}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

// --- 2. VAZIFA YUKLASH FORMASI (Hali yuklanmagan) ---
const HomeworkSubmitForm = ({ homeworkId, onSubmitted }) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const notify = useNotify();

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !file) {
            notify("Iltimos, izoh yozing yoki fayl biriktiring", "warning");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("homework_id", homeworkId);
            formData.append("title", text);
            if (file) {
                formData.append("file", file);
            }

            await axios.post(`${BASE}/homework/answer`, formData, { headers });
            notify("Vazifa muvaffaqiyatli topshirildi!", "success");
            onSubmitted();
        } catch (e) {
            console.error("Vazifa yuborishda xatolik:", e);
            notify("Xatolik: " + (e?.response?.data?.message || e.message), "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 2, bgcolor: '#fff', position: 'relative' }}>
            {/* File preview at the top */}
            {file && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            p: 1.5, 
                            pr: 4, // Leave space for checkmark
                            bgcolor: '#DCF2E3', // Soft green background
                            borderBottom: '3px solid #2E7D32', // Green underline
                            borderRadius: '8px 8px 0 0',
                            position: 'relative',
                            minWidth: 160,
                            maxWidth: 240,
                            height: 44,
                            boxSizing: 'border-box'
                        }}
                    >
                        <InsertDriveFileIcon sx={{ color: '#333', fontSize: 18 }} />
                        <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, color: '#333', flex: 1 }}>
                            {file.name}
                        </Typography>

                        {/* Red delete circle overlapping top-right */}
                        <Box 
                            onClick={() => setFile(null)}
                            sx={{ 
                                position: 'absolute', 
                                top: 4, 
                                right: 6, 
                                bgcolor: '#D32F2F', 
                                color: '#fff', 
                                borderRadius: '50%', 
                                width: 16, 
                                height: 16, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    bgcolor: '#B71C1C'
                                }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 11, fontWeight: 'bold' }} />
                        </Box>

                        {/* Green checkmark at bottom-right */}
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                bottom: 2, 
                                right: 6, 
                                color: '#2E7D32',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontSize: 12, fontWeight: 'bold' }}>✓</span>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Input field and action buttons below */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <InputBase
                    placeholder="Fayl biriktiring va izoh qoldiring"
                    multiline minRows={2} fullWidth
                    value={text} onChange={(e) => setText(e.target.value)}
                    sx={{ fontSize: 15, color: '#333', flex: 1, pr: 2 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, color: '#666', alignItems: 'center' }}>
                        <IconButton size="small" component="label">
                            <AttachFileIcon sx={{ fontSize: 22, color: '#666', transform: 'rotate(45deg)' }} />
                            <input hidden type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </IconButton>
                        
                        <IconButton size="small" type="submit" disabled={submitting}>
                            {file ? (
                                <Badge 
                                    badgeContent={1} 
                                    sx={{ 
                                        '& .MuiBadge-badge': { 
                                            bgcolor: '#C17D49', 
                                            color: '#fff',
                                            fontSize: 9,
                                            height: 15,
                                            minWidth: 15
                                        } 
                                    }}
                                >
                                    <SendIcon sx={{ fontSize: 22, color: '#666' }} />
                                </Badge>
                            ) : (
                                <SendIcon sx={{ fontSize: 22, color: '#666' }} />
                            )}
                        </IconButton>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: '#999', mt: 1 }}>{text.length} / 1000</Typography>
                </Box>
            </Box>
        </Box>
    );
};

// --- 3. MENING JO'NATMALARIM (Yuklangan) ---
const MySubmission = ({ studentComment, link, createdAt, updatedAt, status }) => {
    const files = getFilesList(link);
    return (
        <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 17 }}>Mening jo'natmalarim</Typography>
                <Typography sx={{ fontSize: 14, color: '#333', fontWeight: 500 }}>
                    Fayllar soni: {files.length}
                </Typography>
            </Box>
            
            <Typography sx={{ fontSize: 15, color: '#444', mb: files.length > 0 ? 2 : 0, lineHeight: 1.6 }}>
                {studentComment || "Izoh qoldirilmagan"}
            </Typography>

            {/* Displaying files if any */}
            {files.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, mb: 2 }}>
                    {files.map((file, idx) => {
                        const fileName = file.split('/').pop() || 'file';
                        const fileUrl = file.startsWith('uploads/') 
                            ? `${BASE}/lessons/video/${file.replace('uploads/', '')}`
                            : file;
                        return (
                            <Box 
                                key={idx}
                                component="a"
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1, 
                                    p: 1.5, 
                                    bgcolor: '#fff', 
                                    borderRadius: 2, 
                                    border: '1px solid #E5E7EB',
                                    textDecoration: 'none',
                                    color: '#475569',
                                    minWidth: 220,
                                    maxWidth: 300,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: '#C17D49',
                                        boxShadow: '0 2px 8px rgba(193, 125, 73, 0.1)',
                                        color: '#C17D49'
                                    }
                                }}
                            >
                                <InsertDriveFileIcon sx={{ color: '#C17D49', fontSize: 20 }} />
                                <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
                                    {fileName}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 1, gap: 0.5 }}>
                {createdAt && (
                    <Typography sx={{ fontSize: 13, color: '#777', fontWeight: 500 }}>
                        {formatUzbekDate(createdAt, true)}
                    </Typography>
                )}
                <Box sx={{ 
                    bgcolor: '#FFFFFF', 
                    color: '#6B7280', 
                    px: 1.2, 
                    py: 0.4, 
                    borderRadius: '4px', 
                    fontSize: 11, 
                    fontWeight: 500,
                    border: '1px solid #D1D5DB'
                }}>
                    Tahrirlangan
                </Box>
            </Box>
        </Box>
    );
};

// --- 4. O'QITUVCHI IZOHI (Tekshirilgan) ---
const TeacherFeedback = ({ feedback, score, status }) => {
    let statusLabel = "Vazifa qabul qilindi";
    let statusColor = "#2e7d32";
    if (status === "PENDING") {
        statusLabel = "Kutilmoqda";
        statusColor = "#1976d2";
    } else if (status === "INCOMPLETE") {
        statusLabel = "Qayta topshirish so'raldi (Chala)";
        statusColor = "#ed6c02";
    } else if (status === "REJECTED") {
        statusLabel = "Rad etildi";
        statusColor = "#d32f2f";
    }

    return (
        <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#333' }}>O'qituvchi izohi</Typography>
                <Typography sx={{ color: statusColor, fontWeight: 600, fontSize: 14 }}>{statusLabel}</Typography>
            </Box>
            <Typography sx={{ fontSize: 15, color: '#444', mb: 2 }}>{feedback || "Izoh qoldirilmagan"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ textAlign: 'center', color: '#555', fontSize: 14 }}>
                Ball: {score}
            </Typography>
        </Box>
    );
};

// ================= ASOSIY SAHIFA =================

export default function LessonDetailPage({ lessonId, groupId, groupName, onBack }) {
    const [lessonData, setLessonData] = useState(null);
    const [lessonsList, setLessonsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState(lessonId);
    const [expandedPanel, setExpandedPanel] = useState(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchLessonDetail = async (id) => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE}/homework/lesson/${id}/homeworks`, { headers });
            setLessonData(res.data);
            setExpandedPanel(id);
        } catch (e) {
            console.error("Dars tafsilotini yuklashda xatolik:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await axios.get(`${BASE}/groups/${groupId}/lessons`, { headers });
                setLessonsList(res.data);
            } catch (e) {
                console.error("Guruh darslarini yuklashda xatolik:", e);
            }
        };
        if (groupId) {
            fetchLessons();
        }
    }, [groupId]);

    useEffect(() => {
        if (activeLessonId) {
            fetchLessonDetail(activeLessonId);
        }
    }, [activeLessonId]);

    const handleAccordionChange = (panelId) => (event, isExpanded) => {
        setExpandedPanel(isExpanded ? panelId : false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F0F2F5' }}>
                <CircularProgress sx={{ color: '#C17D49' }} />
            </Box>
        );
    }

    const hasVideo = !!lessonData?.video;
    const videoName = lessonData?.topic;
    const videoUrl = lessonData?.video ? `${BASE}/lessons/video/${lessonData.video.replace('uploads/', '')}` : null;
    const hasHomework = !!lessonData?.homework;
    const taskDesc = lessonData?.homework?.title;
    
    const getDeadlineDate = (createdAtStr) => {
        if (!createdAtStr) return "";
        const dateObj = new Date(createdAtStr);
        dateObj.setHours(dateObj.getHours() + 20);
        return dateObj.toISOString();
    };

    const deadline = lessonData?.homework ? formatUzbekDate(getDeadlineDate(lessonData.homework.created_at), false) : "";

    const studentAnswer = lessonData?.homework?.homeworkAnswerStudents?.[0];
    let submissionStatus = "NOT_SUBMITTED";
    if (studentAnswer) {
        if (studentAnswer.homeworkResults && studentAnswer.homeworkResults.length > 0) {
            submissionStatus = "GRADED";
        } else {
            submissionStatus = "SUBMITTED";
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F0F2F5', overflow: 'hidden', p: 2, gap: 1 }}>
            
            {/* Header / Back Button Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {groupName || "Guruh"} - Dars Tafsiloti
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 2 }}>
                
                {/* CHAP TOMON: ASOSIY CONTENT */}
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#C17D49', borderRadius: '4px' } }}>
                    
                    {/* Lesson name topic block */}
                    {lessonData?.topic && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 2, 
                                mb: 2, 
                                borderRadius: 2, 
                                border: '1px solid #E5E7EB', 
                                bgcolor: '#fff'
                            }}
                        >
                            <Typography sx={{ color: '#111827', fontSize: 16, fontWeight: 600 }}>
                                {lessonData.topic}
                            </Typography>
                        </Paper>
                    )}

                    {hasVideo ? (
                        <VideoSection videoName={videoName} videoUrl={videoUrl} />
                    ) : (
                        <NoVideoAvailable />
                    )}

                    {hasHomework && (
                        <Paper sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, borderBottom: '1px solid #E5E7EB' }}>
                                <Typography sx={{ color: '#C17D49', fontWeight: 600, py: 2, borderBottom: '2px solid #C17D49' }}>
                                    Vazifalar
                                </Typography>
                                {submissionStatus === "GRADED" && (
                                    <Typography sx={{ color: '#C17D49', fontWeight: 600 }}>
                                        Ball: {studentAnswer.homeworkResults[0].score}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <HomeworkTask 
                                    taskDesc={taskDesc} 
                                    deadline={deadline} 
                                    files={getFilesList(lessonData?.homework?.file)}
                                    createdAt={lessonData?.homework?.created_at}
                                />

                                {submissionStatus === "NOT_SUBMITTED" && (
                                    <HomeworkSubmitForm 
                                        homeworkId={lessonData.homework.id} 
                                        onSubmitted={() => fetchLessonDetail(activeLessonId)} 
                                    />
                                )}

                                {submissionStatus === "SUBMITTED" && (
                                    <MySubmission 
                                        studentComment={studentAnswer.title} 
                                        link={studentAnswer.file} 
                                        createdAt={studentAnswer.created_at}
                                        updatedAt={studentAnswer.update_at}
                                        status={studentAnswer.status}
                                    />
                                )}

                                {submissionStatus === "GRADED" && (
                                    <>
                                        <MySubmission 
                                            studentComment={studentAnswer.title} 
                                            link={studentAnswer.file} 
                                            createdAt={studentAnswer.created_at}
                                            updatedAt={studentAnswer.update_at}
                                            status={studentAnswer.status}
                                        />
                                        <TeacherFeedback 
                                            feedback={studentAnswer.homeworkResults[0].title} 
                                            score={studentAnswer.homeworkResults[0].score} 
                                            status={studentAnswer.status}
                                        />
                                    </>
                                )}
                            </Box>
                        </Paper>
                    )}

                    {!hasVideo && !hasHomework && (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                            <Typography sx={{ color: "#6B7280" }}>
                                Bu darsda video ham, uyga vazifa ham yuklanmagan.
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* O'NG TOMON: SIDEBAR (Darslar ro'yxati) */}
                <Box sx={{ 
                    width: 350, 
                    overflowY: 'auto', 
                    pl: 1, pr: 1, 
                    borderLeft: '4px solid #E5E7EB',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#C17D49', borderRadius: '4px' }
                }}>
                   <Typography sx={{ fontWeight: 600, color: '#333', mb: 2 }}>Darslar ro'yxati</Typography>
                   {lessonsList.map((lesson) => {
                       const isActive = lesson.id === activeLessonId;
                       const hasVideo = !!lesson.video;
                       const isExpanded = expandedPanel === lesson.id;
                       
                       return (
                           <Accordion 
                               key={lesson.id}
                               expanded={isExpanded} 
                               onChange={handleAccordionChange(lesson.id)}
                               sx={{ 
                                   mb: 1.5, 
                                   bgcolor: isActive ? '#F3E1C8' : '#FAF7F2', 
                                   borderRadius: '8px !important', 
                                   boxShadow: 'none', 
                                   border: isActive ? '1.5px solid #C17D49' : '1px solid #E5E7EB',
                                   '&:before': { display: 'none' },
                                   overflow: 'hidden'
                               }}
                           >
                               <AccordionSummary 
                                   expandIcon={hasVideo ? <ExpandMoreIcon /> : null}
                                   sx={{ px: 2, py: 0.5 }}
                                   onClick={() => {
                                       setActiveLessonId(lesson.id);
                                   }}
                               >
                                   <Box>
                                       <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#222', mb: 0.5 }}>
                                           {lesson.topic}
                                       </Typography>
                                       <Typography sx={{ fontSize: 12, color: '#777' }}>
                                           Dars sanasi: {new Date(lesson.created_at).toLocaleDateString()}
                                       </Typography>
                                   </Box>
                               </AccordionSummary>
                               {hasVideo && (
                                   <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                           <Box 
                                               sx={{ 
                                                   display: 'flex', alignItems: 'center', gap: 1.5, 
                                                   p: 1.5, bgcolor: '#EAD1B3', borderRadius: 1.5, 
                                                   cursor: 'pointer',
                                                   '&:hover': { bgcolor: '#dfc4a3' }
                                               }}
                                               onClick={(e) => {
                                                   e.stopPropagation();
                                                   setActiveLessonId(lesson.id);
                                               }}
                                           >
                                               <PlayCircleIcon sx={{ color: '#555', fontSize: 20 }} />
                                               <Typography sx={{ fontSize: 13, color: '#222', fontWeight: 500 }}>
                                                   Dars videosini ko'rish
                                               </Typography>
                                           </Box>
                                       </Box>
                                   </AccordionDetails>
                               )}
                           </Accordion>
                       );
                   })}
                </Box>
            </Box>
        </Box>
    );
}