const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware para ler dados em JSON
app.use(bodyParser.json());

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '8533',
    database: 'data_processing',
    port: 3306
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

// Endpoint para processar e armazenar dados
app.post('/processar-dados', (req, res) => {
    const dadosLimpios = req.body.usuarios;

    if (!dadosLimpios || !Array.isArray(dadosLimpios)) {
        return res.status(400).send('Dados inválidos: Esperado um array de usuários.');
    }

    db.beginTransaction((err) => {
        if (err) throw err;

        dadosLimpios.forEach((usuario, index) => {
            const { id, nome, idade, email, telefone, endereco, data_cadastro, ativo, salario } = usuario;

            const isValidDate = (dateString) => {
                const regex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateString || !dateString.match(regex)) return false;
                const date = new Date(dateString);
                return date instanceof Date && !isNaN(date.getTime());
            };

            const validDate = data_cadastro && isValidDate(data_cadastro) ? data_cadastro : null;

            const query = `
                INSERT INTO usuarios (id, nome, idade, email, telefone, endereco, data_cadastro, ativo, salario)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    nome = VALUES(nome),
                    idade = VALUES(idade),
                    email = VALUES(email),
                    telefone = VALUES(telefone),
                    endereco = VALUES(endereco),
                    data_cadastro = VALUES(data_cadastro),
                    ativo = VALUES(ativo),
                    salario = VALUES(salario)
            `;

            db.query(query, [id, nome, idade, email, telefone, endereco, validDate, ativo, salario], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        throw err;
                    });
                }

                if (index === dadosLimpios.length - 1) {
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }
                        res.send('Dados processados e armazenados com sucesso!');
                    });
                }
            });
        });
    });
});

// Endpoint para consultar dados processados
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint para remover usuário
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
        if (err) throw err;

        if (result.affectedRows === 0) {
            res.status(404).send('Usuário não encontrado.');
        } else {
            res.send('Usuário removido com sucesso.');
        }
    });
});

// Endpoint para alterar usuário
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, endereco, data_cadastro, ativo, salario } = req.body;

    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString || !dateString.match(regex)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    };

    const validDate = data_cadastro && isValidDate(data_cadastro) ? data_cadastro : null;

    const fields = [];
    const values = [];

    if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
    if (idade !== undefined) { fields.push('idade = ?'); values.push(idade); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (telefone !== undefined) { fields.push('telefone = ?'); values.push(telefone); }
    if (endereco !== undefined) { fields.push('endereco = ?'); values.push(endereco); }
    if (validDate !== null) { fields.push('data_cadastro = ?'); values.push(validDate); }
    if (ativo !== undefined) { fields.push('ativo = ?'); values.push(ativo); }
    if (salario !== undefined) { fields.push('salario = ?'); values.push(salario); }

    values.push(id);

    if (fields.length === 0) {
        return res.status(400).send('Nenhum campo fornecido para atualização.');
    }

    const query = `
        UPDATE usuarios
        SET ${fields.join(', ')}
        WHERE id = ?
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).send('Erro ao atualizar usuário.');
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Usuário não encontrado.');
        } else {
            res.send('Usuário atualizado com sucesso.');
        }
    });
});

// Iniciar o servidor
app.listen(3006, () => {
    console.log('Servidor de processamento rodando na porta 3006');
});
