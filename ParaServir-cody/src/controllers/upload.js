import multer from 'multer';
import { pool } from "../db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Permitir solo imágenes y PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF) o PDF'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

/**
 * Subir documento de certificación
 * POST /upload/certification
 */
export async function uploadCertification(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    if (!req.file) {
        return res.status(400).json({
            status: "error",
            message: "No se proporcionó ningún archivo"
        });
    }

    try {
        // Construir URL del archivo (en producción sería una URL pública)
        const fileUrl = `/uploads/${req.file.filename}`;
        // En producción, usaría algo como: `${process.env.CDN_URL}/${req.file.filename}`

        // Actualizar el perfil del trabajador con la URL del certificado
        await pool.query(
            `UPDATE worker_profiles 
             SET certification_url = $1, updated_at = NOW()
             WHERE user_id = $2`,
            [fileUrl, userId]
        );

        return res.status(200).json({
            status: "success",
            message: "Certificación subida correctamente",
            file_url: fileUrl
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al subir el archivo",
            error: error.message
        });
    }
}

/**
 * Subir avatar
 * POST /upload/avatar
 */
export async function uploadAvatar(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "No autenticado" });
    }

    if (!req.file) {
        return res.status(400).json({
            status: "error",
            message: "No se proporcionó ningún archivo"
        });
    }

    try {
        const fileUrl = `/uploads/${req.file.filename}`;

        // Actualizar el perfil con la URL del avatar
        await pool.query(
            `UPDATE profiles 
             SET avatar_url = $1, updated_at = NOW()
             WHERE user_id = $2`,
            [fileUrl, userId]
        );

        return res.status(200).json({
            status: "success",
            message: "Avatar actualizado correctamente",
            file_url: fileUrl
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al subir el avatar",
            error: error.message
        });
    }
}
