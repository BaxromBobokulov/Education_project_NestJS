import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Button 
} from '@mui/material';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, title = "O'chirishni tasdiqlaysizmi?", text = "Ushbu ma'lumotni o'chirib yubormoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi." }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: '12px', p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: 14, color: '#64748b' }}>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
            onClick={onClose} 
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
        >
          Bekor qilish
        </Button>
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            color="error" 
            sx={{ 
                textTransform: 'none', 
                fontWeight: 700, 
                borderRadius: '8px',
                boxShadow: 'none',
                "&:hover": { boxShadow: 'none' }
            }}
        >
          O'chirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
