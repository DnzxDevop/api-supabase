require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());

// Endpoint para verificar se o IP está na whitelist
// Endpoint para verificar se o IP está na whitelist
app.post('/check-ip', async (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        return res.status(400).json({ error: 'IP é obrigatório.' });
    }

    try {
        // Verifica se o IP está na tabela allowed_ips
        const { data: allowedIp, error: fetchError } = await supabase
            .from('allowed_ips')
            .select('*')
            .eq('ip', ip)
            .single(); // Retorna um único objeto ou erro se não houver

        // Verifica se houve um erro na busca
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Erro ao buscar IP:', fetchError);
            return res.status(500).json({ error: 'Erro ao verificar IP.' });
        }

        // Se allowedIp for null, o IP não está na whitelist
        if (!allowedIp) {
            return res.status(403).json({ error: 'IP não permitido.' }); // Resposta 403 se o IP não estiver na whitelist
        }

        return res.status(200).json({ status: 'success', message: 'IP permitido.' });
    } catch (err) {
        console.error('Erro inesperado:', err);
        return res.status(500).json({ error: 'Erro inesperado.' });
    }
});


// Endpoint para receber dados
app.post('/endpoint', async (req, res) => {
    const { ip, message } = req.body;

    if (!ip || !message) {
        return res.status(400).json({ error: 'IP e mensagem são obrigatórios.' });
    }

    // Gera um ID de 256 bits usando SHA-256
    const id = crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits

    try {
        // Verificar se o IP já existe
        const { data: existingIp, error: fetchError } = await supabase
            .from('ips')
            .select('*')
            .eq('ip', ip)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Erro ao buscar IP:', fetchError);
            return res.status(500).json({ error: 'Erro ao verificar IP.' });
        }

        // Se o IP não existir, insira-o na tabela
        if (!existingIp) {
            const { error: insertError } = await supabase
                .from('ips')
                .insert([{ id, ip }]); // Adiciona o ID gerado

            if (insertError) {
                console.error('Erro ao inserir IP:', insertError);
                return res.status(500).json({ error: 'Erro ao registrar IP.' });
            }

            console.log(`IP ${ip} registrado na base de dados com ID ${id}.`);
        } else {
            console.log(`IP ${ip} já existe na base de dados.`);
        }

        console.log(`Recebido IP: ${ip}, Mensagem: ${message}`);
        return res.status(200).json({ status: 'success', message: 'Dados recebidos com sucesso.' });
    } catch (err) {
        console.error('Erro inesperado:', err);
        return res.status(500).json({ error: 'Erro inesperado.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
