import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getImoveis, getImoveisNomes, createImovel, deleteImovel } from '../src/controllers/propertyController.js';
import Imovel from '../src/models/propertyModel.js';
import User from '../src/models/userModel.js';      
import Arquivo from '../src/models/fileModel.js';   

jest.mock('../src/models/propertyModel.js');        
jest.mock('../src/models/userModel.js');
jest.mock('../src/models/fileModel.js');

describe('Imoveis Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { user: { id: '123', email: 'teste@teste.com' }, body: {}, params: { id: 'abc' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // getImoveis
  describe('getImoveis', () => {
    it('deve retornar lista de imóveis', async () => {
      // Arrange
      const fakeImoveis = [{ nome: 'Casa 1' }, { nome: 'Apartamento 2' }];
      (Imovel.find as any).mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeImoveis) });

      // Act
      await getImoveis(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeImoveis);
    });

    it('deve retornar 400 se userId não existir', async () => {
      // Arrange
      req.user = {};

      // Act
      await getImoveis(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID de usuário não encontrado no token.' });
    });
  });

  // getImoveisNomes
  describe('getImoveisNomes', () => {
    it('deve retornar apenas nomes dos imóveis', async () => {
      // Arrange
      const fakeImoveis = [{ nome: 'Casa 1' }, { nome: 'Apartamento 2' }];
      (Imovel.find as any).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeImoveis) });

      // Act
      await getImoveisNomes(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeImoveis);
    });

    it('deve retornar 400 se userId não existir', async () => {
      // Arrange
      req.user = {};

      // Act
      await getImoveisNomes(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID de usuário não encontrado no token.' });
    });
  });

  // createImovel
  describe('createImovel', () => {
    it('deve criar um novo imóvel', async () => {
      // Arrange
      req.body = { nome: 'Casa Nova', cep: '12345', rua: 'Rua A', numero: '10', bairro: 'Centro', cidade: 'Cidade', estado: 'ST', tipo: 'Apartamento' };
      (User.findOne as any).mockResolvedValue({ _id: '123', email: 'teste@teste.com' });
      (Imovel.create as any).mockResolvedValue({ ...req.body, user: '123' });

      // Act
      await createImovel(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ ...req.body, user: '123' });
    });

    it('deve retornar 400 se nome não for informado', async () => {
      // Arrange
      req.body = {};

      // Act
      await createImovel(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'O campo "nome" é obrigatório.' });
    });

    it('deve retornar 404 se usuário não existir', async () => {
      // Arrange
      req.body = { nome: 'Casa Nova' };
      (User.findOne as any).mockResolvedValue(null);

      // Act
      await createImovel(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
    });
  });

  // deleteImovel
  describe('deleteImovel', () => {
    it('deve excluir um imóvel sem notas vinculadas', async () => {
      // Arrange
      (Arquivo.countDocuments as any).mockResolvedValue(0);
      (Imovel.findByIdAndDelete as any).mockResolvedValue({ _id: 'abc' });

      // Act
      await deleteImovel(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({ message: 'Imóvel excluído com sucesso.' });
    });

    it('deve retornar 400 se houver notas vinculadas', async () => {
      // Arrange
      (Arquivo.countDocuments as any).mockResolvedValue(2);

      // Act
      await deleteImovel(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Este imóvel possui notas vinculadas e não pode ser excluído.' });
    });

    it('deve retornar 404 se imóvel não for encontrado', async () => {
      // Arrange
      (Arquivo.countDocuments as any).mockResolvedValue(0);
      (Imovel.findByIdAndDelete as any).mockResolvedValue(null);

      // Act
      await deleteImovel(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Imóvel não encontrado.' });
    });
  });
});
