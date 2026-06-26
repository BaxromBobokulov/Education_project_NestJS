import { Box, Typography } from "@mui/material";

// --- 2-QISM: MENING JO'NATMALARIM ---
const MySubmission = () => (
    <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, color: '#333' }}>Mening jo'natmalarim</Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>Fayllar soni: 0</Typography>
        </Box>
        <Link href="#" sx={{ color: '#1a73e8', fontSize: 14, display: 'block', mb: 1, wordBreak: 'break-all' }}>
            https://github.com/BaxromBobokulov/Education_project_NestJS.git
        </Link>
        <Typography sx={{ fontSize: 15, color: '#444', mb: 4 }}>
            Ustoz server ishlamasa ochib bolmaydi , ertaga darsda server bilan ishlatib korsataman , inshaolloh
        </Typography>
        <Typography sx={{ textAlign: 'right', color: '#999', fontSize: 12 }}>
            14:54 10 Iyun, 2026
        </Typography>
    </Box>
);