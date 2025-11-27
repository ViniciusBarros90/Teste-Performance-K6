const express = require('express');
const habitService = require('../service/habitService');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET = 'supersecret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não informado' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não informado' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.username = payload.username;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

router.use(authMiddleware);

router.post('/', (req, res) => {
  const { habit } = req.body;
  if (!habit) return res.status(400).json({ error: 'Hábito obrigatório' });
  try {
    const result = habitService.addHabit(req.username, habit);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const habits = habitService.listHabits(req.username);
  res.json(habits);
});

module.exports = router;
