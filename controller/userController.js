const express = require('express');
const jwt = require('jsonwebtoken');
const userService = require('../service/userService');
const router = express.Router();
const SECRET = 'supersecret';

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Login e senha obrigatórios' });
  }
  try {
    userService.registerUser(username, password);
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  try {
    userService.authenticateUser(username, password);
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json(userService.listUsers());
});

module.exports = router;
