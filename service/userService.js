const users = require('../model/userModel');
const bcrypt = require('bcryptjs');

function registerUser(username, password) {
  if (users.find(u => u.username === username)) {
    throw new Error('Usuário já existe');
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = { username, password: hashedPassword };
  users.push(user);
  return user;
}

function authenticateUser(username, password) {
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new Error('Credenciais inválidas');
  }
  return user;
}

function listUsers() {
  return users.map(u => ({ username: u.username }));
}

module.exports = { registerUser, authenticateUser, listUsers };
