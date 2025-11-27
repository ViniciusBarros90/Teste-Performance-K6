const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const app = require('../../app');
const userService = require('../../service/userService');
require('dotenv').config();

describe('API REST - Usuário', () => {
  let userMock;
  
    userMock = sinon.stub(userService, 'registerUser')
      .returns({
        username: "vinicius",
        password: "123456"
      });
  
  it('Usando Mock: Deve registrar novo usuário 201', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({
        username: "maria",
        password: "maria"
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("message", "Usuário registrado com sucesso");
  
  }); 
  

         
  const registerError = require('../fixture/register/registerError.json');
  registerError.forEach((teste) => {
    
    it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => { 
      const res = await request(process.env.BASE_URL_REST)
        .post(teste.endpoint)
        .send({
          username: teste.username,
          password: teste.password
        });

      expect(res.status).to.equal(teste.statusCode);
      expect(res.body).to.have.property('error', teste.mensagemEsperada);

    });
    
  });

  it('Listar usuários', async () => { 
    const res = await request(process.env.BASE_URL_REST)
      .get('/users')

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  
  });
  
});


