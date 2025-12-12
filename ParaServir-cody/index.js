import express from 'express';
import { port } from './src/config.js';
import cookieParser from 'cookie-parser';
import UserRoutes from './src/routes/user.js';
import WorkerRoutes from './src/routes/worker.js';
import LoggerRoutes from './src/routes/logger.js';
import CategoryRoutes from './src/routes/category.js';
import ServiceRoutes from './src/routes/service.js';
import ServiceRequestRoutes from './src/routes/serviceRequest.js';
import ReviewRoutes from './src/routes/review.js';
import morgan from "morgan";
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app = express();

// Seguridad y CORS
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Logs de peticiones
app.use(morgan('dev'));

// Parseo de cuerpos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Rutas
app.use('/users', UserRoutes);
app.use('/workers', WorkerRoutes);
app.use('/auth', LoggerRoutes);
app.use('/categories', CategoryRoutes);
app.use('/service-requests', ServiceRequestRoutes);
app.use('/reviews', ReviewRoutes);
app.use('/services', ServiceRoutes)

// Healthcheck sencillo
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Solo levantar servidor en entorno no serverless
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log('Servidor corriendo en el puerto ' + port);
  });
}

export default app;