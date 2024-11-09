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


app.post('/check-ip', async (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        return res.status(400).json({ error: 'IP é obrigatório.' });
    }

    try {
     
        const { data: allowedIp, error: fetchError } = await supabase
            .from('allowed_ips')
            .select('*')
            .eq('ip', ip)
            .single(); 


        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Erro ao buscar IP:', fetchError);
            return res.status(500).json({ error: 'Erro ao verificar IP.' });
        }


        if (!allowedIp) {
            return res.status(403).json({ error: 'IP não permitido.' });
        }

        return res.status(200).json({ status: 'success', message: 'IP permitido.' });
    } catch (err) {
        console.error('Erro inesperado:', err);
        return res.status(500).json({ error: 'Erro inesperado.' });
    }
});



app.post('/endpoint', async (req, res) => {
    const { ip, message } = req.body;

    if (!ip || !message) {
        return res.status(400).json({ error: 'IP e mensagem são obrigatórios.' });
    }

 
    const id = crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits

    try {
  
        const { data: existingIp, error: fetchError } = await supabase
            .from('ips')
            .select('*')
            .eq('ip', ip)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Erro ao buscar IP:', fetchError);
            return res.status(500).json({ error: 'Erro ao verificar IP.' });
        }

 
        if (!existingIp) {
            const { error: insertError } = await supabase
                .from('ips')
                .insert([{ id, ip }]); 

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
