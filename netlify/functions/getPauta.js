const { Pool } = require('pg');

// A variável de ambiente NETLIFY_DATABASE_URL já está configurada no seu Netlify
const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL
});

exports.handler = async (event) => {
    try {
        const client = await pool.connect();
        // AQUI: Altere 'pautas' para o nome da sua tabela no Neon
        // O 'id' deve ser a chave primária da tabela para ordenar corretamente
        const result = await client.query('SELECT * FROM pautas ORDER BY id ASC');
        client.release();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Permite que seu site acesse esta função
            },
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Erro ao buscar pauta:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' })
        };
    }
};