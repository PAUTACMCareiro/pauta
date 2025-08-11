const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido.' };
    }

    try {
        const { items, date } = JSON.parse(event.body);
        const client = await pool.connect();

        await client.query('BEGIN');

        // Primeiro, apaga todos os dados existentes
        // AQUI: Altere 'pautas' para o nome da sua tabela
        await client.query('DELETE FROM pautas');

        // Depois, insere os novos dados
        // AQUI: Adapte os nomes das colunas de acordo com sua tabela ('type', 'number', 'author', 'ementa')
        for (const item of items) {
            const { type, number, author, ementa } = item;
            await client.query(
                'INSERT INTO pautas (type, number, author, ementa) VALUES ($1, $2, $3, $4)',
                [type, number, author, ementa]
            );
        }

        await client.query('COMMIT');
        client.release();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Dados salvos com sucesso!' })
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao salvar pauta:', error);
        client.release();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' })
        };
    }
};