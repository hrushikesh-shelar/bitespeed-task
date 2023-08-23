import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
	user: 'hrushikesh',
	password: '4MWKh0fUmvNSqo3gff8f7NaV9hJAr2Jm',
	host: 'dpg-cjifthgcfp5c73cuqil0-a.oregon-postgres.render.com',
	port: 5432,
	database: 'bitespeed_t701',
});

export { pool };
