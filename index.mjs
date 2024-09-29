import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = 'https://ieoyedaydfagtasckgey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb3llZGF5ZGZhZ3Rhc2NrZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyOTU5OTUsImV4cCI6MjA0Mjg3MTk5NX0.lo04l4V6kcz9W7SiC56LmMtQEIhPSVFwMT_03ze1Fyg';
const supabase = createClient(supabaseUrl, supabaseKey);


app.post('/check-license', async (req, res) => {
    const { licenseId } = req.body;

    if (!licenseId) {
        return res.status(400).json({ error: 'licenseId é obrigatório.' });
    }

    const { data, error } = await supabase
        .from('license')
        .select('id')
        .eq('id', licenseId)
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    const exists = !!data;

    return res.json({ valid: exists });
});

app.post('/add-license', async (req, res) => {
    const { name, valid_until } = req.body;

    if (!name || !valid_until) {
        return res.status(400).json({ error: 'name e valid_until são obrigatórios.' });
    }

    try {
        const { data, error } = await supabase
            .from('license')
            .insert([{ name, valid_until }]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('Erro ao adicionar licença:', err);
        return res.status(500).json({ error: 'Erro ao adicionar licença: ' + err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
