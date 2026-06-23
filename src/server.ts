import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota de Diagnóstico
app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: 'API da Tabela TACO está online! 🚀' });
});

// Rota Principal: Buscar Alimentos
app.get('/api/v1/alimentos', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('alimentos')
      .select('id, descricao, calorias_kcal, proteinas_g, carboidratos_g, lipideos_g')
      .limit(10); // Limitando a 10 apenas para o teste inicial

    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});