const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../app');
const sinon = require('sinon');
const habitService = require('../../service/habitService');

describe('API REST - Hábitos ', () => {
  let token;

  before(async () => {
    const loginJson = require('../fixture/login/login.json');

    // Registra e logar usuário para obter Token
      await request(app)
        .post('/users/register')
        .send(loginJson);

    const res = await request(app)
      .post('/users/login')
      .send(loginJson);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');  

    token = res.body.token;
  
  });
  
  const habitsJson = require('../fixture/habits/habits.json');
  const expectedHabits = habitsJson.map(h => h.habit);

  describe('Registro de hábitos', () => {
    before(async () => {
    
      for (const teste of habitsJson) {
        const res = await request(app)
          .post('/habits')
          .set('Authorization', `Bearer ${token}`)
          .send(teste);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("username");
        expect(res.body).to.have.property("habit");
                    
      }
        
    });

    it('Usando Mock: Validar Hábito já registrado para este usuário', async () => {
      const habitMock = sinon.stub(habitService, 'addHabit');
        habitMock.throws(new Error('Hábito já registrado para este usuário'));

      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({"habit": "xx"}); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Hábito já registrado para este usuário');

      habitMock.restore();
    
    });

    it('Validar preenchimento obrigatório do hábito', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({"habit": ""}); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Hábito obrigatório');
    });

  });

  describe('Listagem de hábitos', () => {

    it('Deve listar hábitos do usuário logado', async () => {
      const res = await request(app)
        .get('/habits')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.members(expectedHabits);
     
    });

    it('Validar token não informado', async () => {
      const res = await request(app)
        .get('/habits');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Token não informado');
    });

  
  });

});
