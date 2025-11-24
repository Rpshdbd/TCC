const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fitgym"
});

db.connect(err => {
  if (err) throw err;
  console.log("Banco de dados conectado!");
});

// ============================
// ROTAS
// ============================

// Listar alunos
app.get("/alunos", (req, res) => {
  db.query("SELECT * FROM alunos", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

// Cadastrar aluno
app.post("/alunos", (req, res) => {
  const { nome, email, telefone, senha } = req.body;
  db.query(
    "INSERT INTO alunos(nome, email, telefone, senha) VALUES (?,?,?,?)",
    [nome, email, telefone, senha],
    (err) => {
      if (err) return res.json(err);
      res.json({ status: "OK" });
    }
  );
});

// Listar treinos
app.get("/treinos", (req, res) => {
  db.query("SELECT * FROM treinos", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

// Criar treino
app.post("/treinos", (req, res) => {
  const { aluno_id, nome_treino, exercicios } = req.body;
  db.query(
    "INSERT INTO treinos(aluno_id, nome_treino, exercicios) VALUES (?,?,?)",
    [aluno_id, nome_treino, JSON.stringify(exercicios)],
    (err) => {
      if (err) return res.json(err);
      res.json({ status: "OK" });
    }
  );
});

// Registrar pagamento
app.post("/pagamentos", (req, res) => {
  const { aluno_id, tipo, valor } = req.body;
  db.query(
    "INSERT INTO pagamentos(aluno_id, tipo, valor) VALUES (?, ?, ?)",
    [aluno_id, tipo, valor],
    (err) => {
      if (err) return res.json(err);
      res.json({ status: "OK" });
    }
  );
});

// Listar pagamentos
app.get("/pagamentos", (req, res) => {
  db.query("SELECT * FROM pagamentos", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

// Passagem na catraca
app.post("/catraca", (req, res) => {
  const { aluno_id } = req.body;
  db.query(
    "INSERT INTO catraca(aluno_id) VALUES (?)",
    [aluno_id],
    (err) => {
      if (err) return res.json(err);
      res.json({ status: "OK" });
    }
  );
});

// Contagem catraca
app.get("/catraca/contagem", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM catraca", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows[0]);
  });
});

// Equipamentos
app.get("/equipamentos", (req, res) => {
  db.query("SELECT * FROM equipamentos", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

app.post("/equipamentos", (req, res) => {
  const { nome, descricao } = req.body;
  db.query(
    "INSERT INTO equipamentos(nome, descricao) VALUES (?, ?)",
    [nome, descricao],
    (err) => {
      if (err) return res.json(err);
      res.json({ status: "OK" });
    }
  );
});

// Servidor
app.listen(3307, () => {
  console.log("Servidor rodando na porta 3307");
});
