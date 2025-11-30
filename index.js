import express, { Router } from 'express';
import { port } from './src/config.js';
import cookieParser from 'cookie-parser';
import UserRoutes from './src/routes/user.js';
import WorkerRoutes from './src/routes/worker.js';
import LoggerRoutes from './src/routes/logger.js';
import morgan from "morgan";
import dotenv from 'dotenv';


dotenv.config();

const app = express();

// Ver peticiones por consola
app.use(morgan('dev'))

// Interpretar parametros para post enviados por el usuario en formato json
app.use(express.json());

// Aceptar peticiones post con form encoded
app.use(express.urlencoded({ extended: true }));

// Configurar cookies
app.use(cookieParser());

// Usar rutas
app.use('/users', UserRoutes);
app.use('/workers', WorkerRoutes);
app.use('/auth', LoggerRoutes)


// Iniciar dentro del entrono de desarrollo

// app.listen(port);
// console.log('Servidor corriendo en el puerto ' + port);

// Para que vercel ejecute el servidor

module.exports = app;