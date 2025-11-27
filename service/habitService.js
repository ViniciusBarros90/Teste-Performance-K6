const habits = require('../model/habitModel');

function addHabit(username, habit) {
  if (habits.find(h => h.username === username && h.habit === habit)) {
    throw new Error('Hábito já registrado para este usuário');
  }
  habits.push({ username, habit });
  return { username, habit };
}

function listHabits(username) {
  return habits.filter(h => h.username === username).map(h => h.habit);
}

module.exports = { addHabit, listHabits };
