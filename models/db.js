import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
	user: 'hrushikesh',
	password: 'hrushikesh',
	host: 'localhost',
	port: 5432,
	database: 'bitespeed',
});

export { pool };
