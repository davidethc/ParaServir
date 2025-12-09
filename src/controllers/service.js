import { findCategoryId } from "../helpers/categoryMapper.js";
import { pool } from "../db.js";

export const createService = async (req, res) => {
    const client = await pool.connect();

    try {
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

export const listServices = async(req, res)=>{
    try{

        const client = await pool.connect();

        const { rows} = await client.query(
            `SELECT * FROM worker_services`
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron servicios"
            });
        };

        return res.status(200).json({
            status:"succes",
            rows
        })
    }catch(error){
        return res.status(400).json({   
            message:"Errror al mostrar servicios",
            error: error.message
        })
    }
};

export const watchService = async (req, res)=>{
    
    try{
        const {id} = req.params;
        const client = await pool.connect();
        const { rows } = await client.query(
            `SELECT * FROM worker_services WHERE id = $1`, 
            [id]
         )

        if(!rows || rows.length === 0){
            return res.status(404).json({
                status:"error",
                message:"No se ha encontrado ningún servicio con esa identificación"
            })
        } 

        return res.status(200),json({
            status:"succes",
            message:"Servicio encontrado",
            rows
        })

    }catch(error){
        return res.status(400).json({
            status:"error",
            message:"Error al mostrar el servicio",
            error: error.message
        })
    }
}