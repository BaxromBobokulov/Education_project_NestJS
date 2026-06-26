import { Box, Typography } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// --- 1-QISM: VAZIFA TAVSIFI ---
const HomeworkTask = () => (
    <Box sx={{ bgcolor: '#FAF7F2', p: 3, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 600, color: '#333' }}>Uyga vazifa</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                    bgcolor: '#FF3B30', color: '#fff', px: 1.5, py: 0.5,
                    borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: 13
                }}>
                    <WarningAmberIcon sx={{ fontSize: 16 }} />
                    Uyga vazifa muddati: 10 Iyun, 2026 03:52
                </Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Fayllar soni: 0</Typography>
            </Box>
        </Box>
        <Typography sx={{ fontSize: 15, color: '#444', mb: 4 }}>
            student panelni frontendini to'lliq qilib kelish
        </Typography>
        <Typography sx={{ textAlign: 'right', color: '#999', fontSize: 12 }}>
            11:52 09 Iyun, 2026
        </Typography>
    </Box>
);