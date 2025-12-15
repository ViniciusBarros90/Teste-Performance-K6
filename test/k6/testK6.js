import http from 'k6/http';
import { check, sleep, group } from "k6";
import { getBaseUrl } from './helpers/config.js';
import faker from 'k6/x/faker';
import { Trend } from 'k6/metrics';


export const options = { //Não funcional
  thresholds: {
    http_req_duration: ['p(90)<190', 'p(95)<220' ], // 95% das requisições devem ser menores que 30ms
    http_req_failed: ['rate<0.01'], // Menos de 1% das requisições podem falhar
  }, 

  stages: [
        { duration: '3s', target: 2 }, // Ramp up
        { duration: '7s', target: 2 }, // Average
        { duration: '2s', target: 20 }, // Spike
        { duration: '5s', target: 2 }, // Average
        { duration: '5s', target: 0 }, // Ramp down
  ],
};

const checkoutDuration = new Trend('checkout_duration');

export default function() { //Funcional do teste
  let loginUsuario;
  const baseUrl = getBaseUrl();
  const name = faker.person.firstName();
  const lastName = faker.person.lastName();
  const password = faker.internet.password();
  const habitName = `habit-${__VU}-${__ITER}-${Date.now()}`;

  group('Registrar novo usuário', () => {
    let registrarNovoUsuario = http.post(
      `${baseUrl}/users/register`, 
      JSON.stringify({
        username: `${name} ${lastName}`, 
        password: password
      }), 
      
      {   
          headers: { 
              'Content-Type': 'application/json'  
          } 
          
    });

    check(registrarNovoUsuario, {
      'status is 201': (res) => res.status === 201
    });
      
  })  
  
  group('Login do usuário e obter token', () => {
    loginUsuario = http.post(
      `${baseUrl}/users/login`, 
      JSON.stringify({
        username: `${name} ${lastName}`, 
        password: password
      
      }), 
      
      {   
          headers: { 
              'Content-Type': 'application/json',
          } 
          
    });
  
    check(loginUsuario, {
      'status is 200': (res) => res.status === 200
    }); 
      
  })
  

  group('Registrar novo hábito', () => {
    let registrarHabito = http.post(
      `${baseUrl}/habits`, 
      JSON.stringify({
        habit: habitName, 
               
      }), 
      
      {   
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginUsuario.json('token')}`
              
          } 
          
      }
    );

    checkoutDuration.add(registrarHabito.timings.duration);
  
    check(registrarHabito, {
      'status is 201': (res) => res.status === 201
    }); 
    
  })
   
  group('Simulando o pensamento do usuário', () => {
    sleep(3); // User Think Time
  });

}
