import { Box, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// --- 3-QISM: O'QITUVCHI IZOHI ---
const TeacherFeedback = () => (
    <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, color: '#333' }}>O'qituvchi izohi</Typography>
            <Typography sx={{ color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>Vazifa qabul qilindi</Typography>
        </Box>
        <Box sx={{ 
            bgcolor: '#FFF9E6', border: '1px solid #FFE58F', p: 2, 
            borderRadius: 1, display: 'flex', gap: 1.5, mb: 2 
        }}>
            <WarningAmberIcon sx={{ color: '#FAAD14', fontSize: 20 }} />
            <Typography sx={{ color: '#856404', fontSize: 14 }}>
                6 soatdan kechikib topshirilgani uchun qo'yilgan 87 ball 10 % ga kamaytirildi.
            </Typography>
        </Box>
        <Typography sx={{ fontSize: 15, color: '#444', mb: 2 }}>
            yaxshi bajarilgan shunday davom eting
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666' }}>
            Tekshiruvchi: Barchinoy +++Yusupova
        </Typography>
        <Typography sx={{ textAlign: 'right', color: '#999', fontSize: 12, mb: 2 }}>
            08:35 11 Iyun, 2026
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ textAlign: 'center', color: '#555', fontSize: 14 }}>
            Qayta topshirish imkoniyati berilmagan
        </Typography>
    </Box>
);
