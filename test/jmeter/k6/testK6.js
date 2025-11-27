import http from 'k6/http';
import { check, sleep, group } from "k6";

export const options = { //Não funcional
  vus: 10,
  duration: '25s',
  //iterations : 10,

  thresholds: {
    http_req_duration: ['p(90)<70', 'p(95)<72' ], // 95% das requisições devem ser menores que 30ms
    http_req_failed: ['rate<0.01'], // Menos de 1% das requisições podem falhar
  }, 
};

export default function() { //Funcional do teste
  let loginUsuario;
  const username = `tester-${__VU}-${__ITER}-${Date.now()}@test.com`;
  const password = '123456';
  const habitName = `habit-${__VU}-${__ITER}-${Date.now()}`;

  group('Registrar novo usuário', () => {
    let registrarNovoUsuario = http.post(
      'http://localhost:3000/users/register', 
      JSON.stringify({
          username: username, 
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
    console.log("Status registrar novo usuário:", registrarNovoUsuario.status);
    console.log("Body registrar novo usuário:", registrarNovoUsuario.body);
  
  })  
  
  group('Login do usuário e obter token', () => {
    loginUsuario = http.post(
      'http://localhost:3000/users/login', 
      JSON.stringify({
          username: username,
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

    console.log("Status login:", loginUsuario.status);
    
  })
  console.log("TOKEN do login:", loginUsuario.json('token'));

  group('Registrar novo hábito', () => {
    let registrarHabito = http.post(
      'http://localhost:3000/habits', 
      JSON.stringify({
          habit: habitName, 
               
      }), 
      
      {   
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginUsuario.json('token')}`
              
          } 
          
    });
  
    check(registrarHabito, {
      'status is 201': (res) => res.status === 201
    }); 
    console.log("Status Hábitos:", registrarHabito.status);
    console.log("Body Hábitos:", registrarHabito.body);
  })
 

  
  group('Simulando o pensamento do usuário', () => {
    sleep(1); // User Think Time
  });

}
