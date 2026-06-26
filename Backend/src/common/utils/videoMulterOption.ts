import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export const videoMulterOptions = {
  // Faylni qayerga va qanday nom bilan saqlash
  storage: diskStorage({
    destination: './uploads/videos', // Loyiha papkasida uploads/videos degan joyga tushadi
    filename: (req, file, cb) => {
      // Bir xil nomli videolar ustma-ust tushmasligi uchun UUID ishlatamiz
      const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    },
  }),
  // Fayl turini tekshirish (Faqat videolar)
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(mp4|x-matroska|avi|quicktime)$/)) {
      return cb(
        new BadRequestException('Faqat video formatdagi fayllar yuklash mumkin! (mp4, mkv, avi, mov)'),
        false,
      );
    }
    cb(null, true);
  },
  // Fayl hajmini cheklash (Masalan: 100 MB)
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
};