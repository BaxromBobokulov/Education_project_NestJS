import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import axios from 'axios';
import { useNotify } from './NotificationContext';

const VideoUploadModal = ({ open, onClose, groupId, onSuccess }) => {
  const fileInputRef = useRef(null);
  const notify = useNotify();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch group lessons when modal opens
  useEffect(() => {
    if (open && groupId) {
      axios.get(`http://localhost:3000/lessons/group/${groupId}`, { headers })
        .then(res => {
          setLessons(res.data || []);
        })
        .catch(err => {
          console.error("Error fetching group lessons:", err);
        });
    }
  }, [open, groupId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile({
        fileName: file.name,
        lessonId: 'NEW_LESSON', // Default to creating a new lesson topic
        videoName: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        file: file,
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFile.file) {
      notify("Iltimos, avval video faylni yuklang/tanlang!", "warning");
      return;
    }
    if (!selectedFile.lessonId) {
      notify("Iltimos, darsni tanlang yoki 'Yangi dars' variantini tanlang!", "warning");
      return;
    }
    if (!selectedFile.videoName.trim()) {
      notify("Iltimos, video nomini kiriting!", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      if (selectedFile.lessonId === 'NEW_LESSON') {
        // POST request for a new lesson topic
        formData.append('group_id', groupId);
        formData.append('topic', selectedFile.videoName);
        formData.append('video', selectedFile.file);
        
        await axios.post('http://localhost:3000/lessons/video-only', formData, { headers });
        notify("Yangi video dars muvaffaqiyatli yuklandi!", "success");
      } else {
        // PATCH request to attach video to existing lesson
        formData.append('topic', selectedFile.videoName);
        formData.append('video', selectedFile.file);
        
        await axios.patch(`http://localhost:3000/lessons/${selectedFile.lessonId}`, formData, { headers });
        notify("Dars videosi muvaffaqiyatli yuklandi!", "success");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to upload video:", err);
      notify(err.response?.data?.message || "Video yuklashda xatolik yuz berdi", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      {/* Header */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '18px' }}>
          Qo'shish
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'grey.500' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: 'none', px: 3, pb: 3 }}>
        {/* Drag & Drop Area */}
        <Box
          onClick={handleBoxClick}
          sx={{
            border: '1px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".mp4,.webm,.mpeg,.avi,.mkv,.m4v,.ogm,.mov,.mpg"
          />
          <MoveToInboxIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
          <Typography variant="body1" sx={{ color: '#111827', mb: 0.5 }}>
            Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Videofayl .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov, .mpg formatlaridan birida bo'lishi kerak
          </Typography>
        </Box>

        {/* Selected File List Area */}
        {selectedFile && (
          <Box sx={{ border: '1px dashed #e5e7eb', borderRadius: '4px', mt: 3, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Table Headers */}
              <Grid item xs={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>File name</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  <span style={{ color: 'red' }}>*</span> Dars
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  <span style={{ color: 'red' }}>*</span> Video nomi
                </Typography>
              </Grid>
              <Grid item xs={1} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Actions</Typography>
              </Grid>

              {/* Table Row */}
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ color: '#374151', wordBreak: 'break-all' }}>
                  {selectedFile.fileName}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={selectedFile.lessonId}
                  onChange={(e) => setSelectedFile({ ...selectedFile, lessonId: e.target.value })}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                  }}
                >
                  <MenuItem value="NEW_LESSON">
                    Yangi dars yaratish
                  </MenuItem>
                  {lessons.map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {lesson.topic}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  value={selectedFile.videoName}
                  onChange={(e) => setSelectedFile({ ...selectedFile, videoName: e.target.value })}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#d1d5db' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={1} sx={{ textAlign: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={handleRemoveFile}
                  sx={{ 
                    border: '1px solid #d1d5db', 
                    borderRadius: '50%',
                    color: '#4b5563',
                    '&:hover': { backgroundColor: '#fee2e2', color: '#ef4444', borderColor: '#fca5a5' }
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          disabled={uploading}
          sx={{ 
            color: '#4b5563', 
            borderColor: '#d1d5db',
            textTransform: 'none',
            borderRadius: '6px',
            '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' }
          }}
        >
          Bekor qilish
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUpload}
          disabled={uploading}
          sx={{ 
            backgroundColor: '#10b981', 
            color: '#fff',
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#059669', boxShadow: 'none' }
          }}
        >
          {uploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoUploadModal;