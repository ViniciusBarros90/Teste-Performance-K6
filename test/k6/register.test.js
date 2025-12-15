import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { getBaseUrl } from './helpers/config.js';

const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/register.test.data.json'));
})


export let options = {
  vus: 3,
  iterations: 3,
  thresholds: {
    http_req_duration: ['p(95) < 2000'], // P95 menor que 2 segundos
  },
};  

export function setup() {
    // deletar usuários
    users.forEach(user => {
      console.log(`Tentando excluir usuário: "${user.username}"`);
      http.del(`${getBaseUrl()}/users/${user.username}`);
    });    
}
       

export default function() {
    const user = users[__VU - 1]; 
    console.log(user);
    const name = user.username;
    const password = user.password;

    
    const registrarNovoUsuario = http.post(
      `${getBaseUrl()}/users/register`,
      JSON.stringify({
          username: name,
          password: password
      
      }), 
      
      {   
          headers: { 
              'Content-Type': 'application/json',
          } 
          
      }
    );
  
    check(registrarNovoUsuario, {
      'status is 201': (res) => res.status === 201
    }); 

    sleep(10);
};    