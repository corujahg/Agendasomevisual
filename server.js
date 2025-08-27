const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const databaseFilePath = path.join(__dirname, 'database.json');

const readDatabase = () => {
    try {
        const data = fs.readFileSync(databaseFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return { events: [], users: [] };
    }
};

const writeDatabase = (data) => {
    fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/events', (req, res) => {
    const data = readDatabase();
    res.json(data.events);
});

app.post('/events', (req, res) => {
    const data = readDatabase();
    const newEvent = { id: uuidv4(), ...req.body };
    data.events.push(newEvent);
    writeDatabase(data);
    res.status(201).json(newEvent);
});

app.delete('/events/:id', (req, res) => {
    const data = readDatabase();
    data.events = data.events.filter(event => event.id !== req.params.id);
    writeDatabase(data);
    res.status(200).json({ message: 'Evento excluído com sucesso.' });
});

app.put('/events/:id', (req, res) => {
    const data = readDatabase();
    const eventIndex = data.events.findIndex(event => event.id === req.params.id);

    if (eventIndex === -1) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    data.events[eventIndex] = { ...data.events[eventIndex], ...req.body };
    writeDatabase(data);
    res.status(200).json(data.events[eventIndex]);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const data = readDatabase();
    
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        // Envia o nível do usuário junto com a mensagem de sucesso
        res.status(200).json({ message: 'Login bem-sucedido.', level: user.level });
    } else {
        res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
});

app.post('/register', (req, res) => {
    const { username, password, level } = req.body;
    const data = readDatabase();

    const userExists = data.users.some(u => u.username === username);
    if (userExists) {
        return res.status(409).json({ error: 'Nome de usuário já existe.' });
    }
    
    data.users.push({ username, password, level });
    writeDatabase(data);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});