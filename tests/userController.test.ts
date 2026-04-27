import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getUserProfile, createProfileInternal } from '../src/controllers/userController.js';

describe('User Controller - Unit Tests', () => {
  let req: any, res: any;

  beforeEach(() => {
    // Mock do request e response do Express
    req = { user: { id: '123' }, body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getUserProfile (Unitário Fácil 1)', () => {
    it('deve retornar erro 400 se o profileId não for informado na rota', async () => {
      // Configuramos o req.params para não conter o ID
      req.params = {};
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do perfil ou usuário autenticado não encontrado.' });
    });
  });

  describe('createProfileInternal (Unitário Fácil 2)', () => {
    it('deve retornar erro 400 se faltar campos obrigatórios para criar o perfil', async () => {
      // Colocamos dados incompletos no Body
      req.body = { nome: 'João Silva' }; // faltam 'email' e 'senha'
      
      await createProfileInternal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome, email e senha são obrigatórios.' });
    });
  });
});
