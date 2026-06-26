import { Avatar, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";
import axios from "axios";
import HomeworkTable from "./StudentHomeworks";

const BASE = "http://localhost:3000";

// Bu map hozircha ishlatilmayapti, lekin kelajakda kerak bo'lsa turgani yaxshi
const daysMap = {
    MONDAY: "Du",
    TUESDAY: "Se",
    WEDNESDAY: "Ch",
    THURSDAY: "Pa",
    FRIDAY: "Ju",
    SATURDAY: "Sh",
    SUNDAY: "Ya"
};

// onGroupClick props orqali qabul qilindi, shunda onClick xato bermaydi
export default function GroupsBelongStudent({ onGroupClick }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem("token");
                const GET_API = `${BASE}/students/student-groups/${getCurrentUser().id}`;
                const response = await axios.get(GET_API, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(response.data);
                setGroups(response.data);
            } catch (error) {
                console.error("Guruhlarni yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setPage(1);
    };

    const startIndex = (page - 1) * perPage;
    const paginatedGroups = groups.slice(startIndex, startIndex + perPage);

    // Jadval qismi - RETURN qo'shildi!
    return (
        <TableContainer
            component={Paper}
            sx={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #E5E7EB",
                borderRadius: 2
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#111827", py: 2 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#111827", py: 2 }}>Guruh nomi</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#111827", py: 2 }}>Yo'nalishi</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#111827", py: 2 }}>O'qituvchi</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#111827", py: 2 }}>Boshlash vaqti</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedGroups.map((item, index) => {
                        // Kod o'qilishiga oson bo'lishi uchun ichkaridagi "groups" obyektini ajratib olamiz
                        const groupInfo = item.groups;

                        // O'qituvchi malumotlarini olish (birinchi o'qituvchini olamiz)
                        // Bazi guruhlarda o'qituvchi bo'lmasligi mumkin, shuning uchun "?." (optional chaining) ishlatamiz
                        const teacher = groupInfo.teacherGroups?.users;

                        return (
                            <TableRow key={groupInfo.id}  sx={{ cursor: "pointer" }} onClick={() => onGroupClick && onGroupClick(groupInfo)}>
                                {/* 1. Tartib raqami */}
                                <TableCell sx={{ color: "#4B5563", py: 2 }}>
                                    {startIndex + index + 1}
                                </TableCell>

                                {/* 2. Guruh nomi */}
                                <TableCell sx={{ color: "#111827", py: 2 }}>
                                    {groupInfo.name}
                                </TableCell>

                                {/* 3. Yo'nalishi (Backendda hozircha yo'nalish maydoni yo'q ekan, hozircha name ni qoyib turamiz yoki o'zing to'g'rilab olasan) */}
                                <TableCell sx={{ color: "#4B5563", py: 2 }}>
                                    Programming
                                </TableCell>

                                {/* 4. O'qituvchi (Avatar va ism) */}
                                <TableCell sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            sx={{
                                                width: 25,
                                                height: 25,
                                                bgcolor: "#C4843D",
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        >
                                            {/* O'qituvchi ismi bo'lsa birinchi harfini, yo'q bo'lsa "U" (Unknown) harfini chiqaramiz */}
                                            {teacher ? teacher.first_name.charAt(0) : "23"}
                                        </Avatar>
{/* 
                                        <Typography sx={{ fontSize: 14, color: "#111827" }}>
                                            {teacher ? `${teacher.first_name} ${teacher.last_name}` : "Biriktirilmagan"}
                                        </Typography> */}
                                    </Box>
                                </TableCell>

                                {/* 5. Boshlash vaqti va sanasi */}
                                <TableCell sx={{ color: "#111827", py: 2 }}>
                                    {groupInfo.start_date}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}