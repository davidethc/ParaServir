import pg from 'pg';

export const pool=new pg.Pool({
    user: "postgres",
    host: "localhost",
    password: "admin123",
    database: "paraservir",
    port: "5432"
})

