import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerConfig = {
    dest: './uploads', // temporary destination
};

export const multerOptions = {

    // 1. Check file type (Validation)
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },

    // 2. Storage settings
    storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = './uploads/profile-pics';
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
            // Create a unique filename: userId-timestamp.extension
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `user-${uniqueSuffix}${extname(file.originalname)}`);
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
};