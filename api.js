const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fitgym',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// rotas (exemplo: listar alunos)
app.get('/alunos', (req,res)=>{
  db.query('SELECT * FROM alunos', (err,rows)=>{ if(err) return res.status(500).json(err); res.json(rows); });
});

// outras rotas: POST /alunos, POST /treinos, POST /pagamentos, POST /catraca, POST /equipamentos
// (implemente conforme necessidade seguindo o padrão do earlier messages)

app.listen(3307, ()=>console.log('API rodando em http://localhost:3307'));
