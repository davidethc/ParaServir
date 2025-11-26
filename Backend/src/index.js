import express, { Router } from 'express';
import {port} from './config.js'
import UserRoutes from './routes/user.js';
import WorkerRoutes from './routes/worker.js';
import LoggerRoutes from './routes/logger.js';
import morgan from "morgan";


const app = express();

// Ver peticiones por consola
app.use(morgan('dev'))

// Interpretar parametros para post enviados por el usuario en formato json
app.use(express.json());

// Aceptar peticiones post con form encoded
app.use(express.urlencoded({ extended: true }));

// Usar rutas
app.use('/users', UserRoutes);
app.use('/workers', WorkerRoutes);
app.use('/auth', LoggerRoutes)


app.listen(port);
console.log('Servidor corriendo en el puerto ' + port);