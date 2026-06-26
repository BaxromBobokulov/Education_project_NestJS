import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@ApiTags('Lessons Media')
@Controller('lessons')
export class MediaController {
  
  @ApiOperation({ summary: "Video faylni ko'rish/yuklab olish" })
  @Get('video/*filename')
  serveVideo(@Param('filename') filename: any, @Res() res: Response) {
    let actualFilename = '';

    // Ehtimoliy massiv yoki ob'ekt ko'rinishidagi parametrlarni to'g'ri stringga o'giramiz
    if (Array.isArray(filename)) {
      actualFilename = filename.join('/');
    } else if (typeof filename === 'string') {
      actualFilename = filename;
    } else if (filename && typeof filename === 'object' && filename['0']) {
      actualFilename = String(filename['0']);
    } else if (filename) {
      actualFilename = String(filename);
    }

    if (!actualFilename || actualFilename.trim() === '') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Fayl nomi ko\'rsatilmadi',
      });
    }

    // Tozalangan fayl nomi (agar uploads/videos/ kabi yo'l bilan so'ralsa)
    const cleanFilename = actualFilename.replace(/^uploads\/videos\//, '').replace(/^uploads\//, '');

    // 1. uploads/videos papkasidan qidirish (yangi yuklangan videolar)
    const videosPath = join(process.cwd(), 'uploads', 'videos', cleanFilename);
    if (fs.existsSync(videosPath)) {
      return res.sendFile(videosPath);
    }

    // 2. uploads papkasidan qidirish (eski videolar)
    const uploadsPath = join(process.cwd(), 'uploads', cleanFilename);
    if (fs.existsSync(uploadsPath)) {
      return res.sendFile(uploadsPath);
    }

    // 3. To'liq kelgan yo'l bo'yicha tekshirish (fallback)
    const directPath = join(process.cwd(), actualFilename);
    if (fs.existsSync(directPath)) {
      return res.sendFile(directPath);
    }

    // 4. Video topilmagan holat
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Video fayl topilmadi',
    });
  }
}