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
      .select('id, descricao, calorias_kcal, proteinas_g, carboidratos_g, lipideos_g, fibra_g')
      .limit(10); // Limitando a 10 apenas para o teste inicial

    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

//Rota secundária: Buscar Alimentos por ID
app.get('/api/v1/alimentos/:id', async (req: Request, res: Response) => {
  try{
    //extrai o ID da requisição digitada pelo usuário
    const { id } = req.params;

    //Busca no supabase o alimento com o ID correspondente
    const { data, error } = await supabase
      .from('alimentos')
      .select('id, descricao, calorias_kcal, proteinas_g, carboidratos_g, lipideos_g, fibra_g')
      .eq('id', id)
      .single(); // Retorna apenas um registro

    if (error) {
      // Se houver um erro na consulta, retorna o erro
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }
    
    // Devolve os dados do alimento encontrado
    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});


//Rota de cálculo: Converte os nutrientes para o peso desejado
app.get('/api/v1/alimentos/:id/calcular', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pesoStr = req.query.peso as string || '100'; // Padrão para 100g se não for fornecido

    //Trava de segurança : obriga o envio do peso
    if (!pesoStr) {
      return res.status(400).json({ erro: 'Você precisa informar o peso em gramas. Ex: ?peso=50' });
    }

    const peso = parseFloat(pesoStr);

    // 1. Busca o alimento base (100g) no Supabase
    const { data, error } = await supabase
      .from('alimentos')
      .select('id, descricao, calorias_kcal, proteinas_g, carboidratos_g, lipideos_g, fibra_g')
      .eq('id', id)
      .single();

      if (error) {
        console.error('Erro ao buscar alimento:', error);
        return res.status(404).json({ erro: 'Alimento não encontrado',
        detalhe: error.message 
        });
      }

      // 2. Calcula os nutrientes com base no peso fornecido
      // Se o peso for 35gr, o fator de multiplicação será 0.35 (35/100)
      const fator = peso / 100;

      const alimentoCalculado = {
        id: data.id,
        descricao: data.descricao,
        peso_g: peso,
        calorias_kcal: Number((data.calorias_kcal * fator).toFixed(2)),
        proteinas_g: Number((data.proteinas_g * fator).toFixed(2)),
        carboidratos_g: Number((data.carboidratos_g * fator).toFixed(2)),
        lipideos_g: Number((data.lipideos_g * fator).toFixed(2)),
        fibra_g: Number((data.fibra_g * fator).toFixed(2))
      };

      // 3. Retorna o resultado do cálculo e o alimento com os novos valores
      res.json(alimentoCalculado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});