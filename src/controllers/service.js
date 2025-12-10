import { findCategoryId } from "../helpers/categoryMapper.js";
import { pool } from "../db.js";

export const createService = async (req, res) => {
    let client;

    try {
        client = await pool.connect();
        const userId = req.user.id;
        const { category_id, title, description, base_price } = req.body;

        await client.query("BEGIN");

        // Mapear category_id (nombre) a UUID
        const categoryUUID = await findCategoryId(category_id);
        if (!categoryUUID) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: `Categoría no encontrada: '${category_id}'`
            });
        };

        const countResult = await pool.query(
            `SELECT COUNT(*) AS total FROM worker_services WHERE worker_id = $1`,
            [userId]
        );

        const totalServices = Number(countResult.rows[0].total);

        // Verificar si ya tiene 3 servicios
        if (totalServices >= 3) {
            return res.status(400).json({
                status: "error",
                message: "Este trabajador ya ha creado el número máximo permitido de servicios (3)."
            });
        }

        // Insertar servicio dentro de la transacción   
        const result = await client.query(
            `INSERT INTO worker_services 
            (worker_id, category_id, title, description, base_price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                userId,
                categoryUUID,
                title,
                description || null,
                base_price || null
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            status: "success",
            service: result.rows[0]
        });

    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (e) {
            // ignore rollback error
        }
        res.status(500).json({
            status: "error",
            message: "No se pudo crear el servicio.",
            error: error.message
        });
    } finally {
        client.release();
    }
};

export const listServices = async (req, res) => {
    try {

        const { rows } = await pool.query(
            `SELECT * FROM worker_services`
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron servicios"
            });
        };

        return res.status(200).json({
            status: "succes",
            conteo: rows.length,
            filas: rows
        })
    } catch (error) {
        return res.status(400).json({
            message: "Errror al mostrar servicios",
            error: error.message
        })
    }
};

export const watchService = async (req, res) => {

    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT * FROM worker_services WHERE id = $1`,
            [id]
        )

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se ha encontrado ningún servicio con esa identificación"
            })
        }


        return res.status(200).json({
            status: "succes",
            message: "Servicio encontrado",
            rows
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error al mostrar el servicio",
            error: error.message
        })
    }
};

export const deleteService = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Debe proporcionar el ID del servicio"
            })
        }

        const { rowCount } = await client.query(`
            DELETE FROM worker_services WHERE id = $1`
            , [id]
        );

        if (rowCount === 0) {
            await client.query(`ROLLBACK`);
            return res.status(404).json({
                status: "error",
                message: "No se pudo encontrrar el servicio"
            })
        }

        await client.query(`COMMIT`);
        return res.status(200).json({
            status: "succes",
            message: "Servicio eliminado correctamente",
            rowCount
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error al eliminar el servicio",
            error: error.message
        })
    } finally {
        client.release();
    }
};

export const updateService = async (req, res)=>{
    let client;
    try{
        client = await pool.connect();
        const userId = req.user.id;
        const {id} = req.params;
        const { category_id, title, description, base_price } = req.body;
        
        await client.query(`BEGIN`);

        const exist = await client.query(`
            SELECT * FROM worker_services WHERE id = $1
            `, [id]
        );
        if(!exist || exist.rows.length === 0){
            await client.query(`ROLLBACK`);
            return res.status(404).json({
                status:"error",
                message:"No se encontró el servicio a actualizar"
            })
        };

        const categoryUUID = await findCategoryId(category_id);
        if (!categoryUUID) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                status: "error",
                message: `Categoría no encontrada: '${category_id}'`
            });
        }

        if (exist.rows[0].worker_id !== userId) {
            await client.query(`ROLLBACK`);
            return res.status(403).json({
                status: "error",
                message: "No tienes permisos para actualizar este servicio"
            });
        }

        const {rows} = await client.query(`
            UPDATE worker_services SET
            category_id = $1,
            title = $2,
            description = $3,
            base_price = $4
            WHERE id = $5
            RETURNING *
        `, [
            categoryUUID,
            title,
            description,
            base_price,
            id
        ]);

        await client.query(`COMMIT`);
        return res.status(200).json({
            status:"succes",
            message:"Se ha actualizado correctamente.",
            data:rows[0]
        })

    }catch(error){
        return res.status(400).json({
            status:"error",
            error:error.message
        })
    }finally{
        if(client)client.release();
    }
};