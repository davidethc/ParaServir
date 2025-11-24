import { pool } from "../db.js";

export async function createEmployee(userId, employee) {

    try {

        // Insertar a la base de datos
        await pool.query(
            `INSERT INTO employee (id, titles, description, ocupation, documentation)
                VALUES ($1, $2, $3, $4, $5)`,
            [userId, employee.titles, employee.description, employee.ocupation, employee.documentation]
        );

    } catch (error) {
        return res.status(400).json({
            message: "Ocurrio un error al crear un empleado",
            error: error.message
        })
    }

}
export async function list(req, res) {
    try {
        const { rows } = await pool.query(`
            SELECT u.*, e.titles, e.description, e.ocupation, e.documentation
            FROM users u
            LEFT JOIN employee e ON u.id = e.id
            WHERE role = 'employee';
        `);
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se han encontrado empleados",
                error: error.message
            })
        }
        return res.status(200).json({
            status: "succes",
            rows
        })

    } catch (error) {
        return res.status(401).json({
            message: "No se pudo ver los usuarios",
            error: error.message
        })
    }
}

export async function watch(req, res) {
    try {
        const {id} = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        const { rows } = await pool.query(`
            SELECT u.*, e.titles, e.description, e.ocupation, e.documentation
            FROM users u
            LEFT JOIN employee e ON u.id = e.id
            WHERE u.id = $1 AND role = 'employee';
         `, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "No se ha encontrado ningún empleado con esa identificación",
                error: error.message
            })
        }

        return res.status(200).json({
            status: "succes",
            rows
        });
    } catch (error) {
        return res.status(401).json({
            message: "Hubo un error en la consulta",
            error: error.message
        })
    }

}