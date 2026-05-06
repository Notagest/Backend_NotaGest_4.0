import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js'; // Importa a aplicação exportada para o supertest

describe('Rotas e Middleware de Autenticação - Integration Tests', () => {
  
  it('Teste de Integração 1: deve retornar 401 Unauthorized ao tentar acessar /api/uploads sem um Bearer token', async () => {
    // Arrange & Act (Neste caso de integração simples, a chamada é o próprio ato)
    const response = await request(app).get('/api/uploads');
    
    // Assert
    expect(response.status).toBe(401);
  });

  it('Teste de Integração 2: deve retornar 401 Unauthorized ao tentar acessar /api/imoveis sem um token', async () => {
    // Arrange & Act
    const response = await request(app).get('/api/imoveis');
    
    // Assert
    expect(response.status).toBe(401);
  });
});
