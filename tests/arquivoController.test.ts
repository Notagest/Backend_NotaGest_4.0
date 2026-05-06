import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getArquivos, createArquivo, deleteArquivo, updateArquivo } from '../src/controllers/fileController.js';
import Arquivo from '../src/models/fileModel.js';

jest.mock('../src/models/fileModel.js');

describe('Arquivo Controller', () => {
  let req: any, res: any;

  beforeEach(() => {
    req = { user: { id: '123' }, body: {}, params: { id: 'abc' }, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // getArquivos
  describe('getArquivos', () => {
    it('deve retornar lista de arquivos', async () => {
      // Arrange
      const fakeArquivos = [{ title: 'Arquivo 1' }, { title: 'Arquivo 2' }];
      (Arquivo.find as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArquivos)
        })
      });

      // Act
      await getArquivos(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeArquivos);
    });

    it('deve filtrar por imóvel se query.propertyId existir', async () => {
      // Arrange
      req.query.propertyId = 'Casa 1';
      const fakeArquivos = [{ title: 'Arquivo Casa 1' }];
      (Arquivo.find as any).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArquivos)
        })
      });

      // Act
      await getArquivos(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeArquivos);
    });
  });

  // createArquivo
  describe('createArquivo', () => {
    it('deve criar um novo arquivo', async () => {
      // Arrange
      req.body = { 
        title: 'Doc', 
        value: 100, 
        purchaseDate: '2025-01-01', 
        property: 'abc', 
        category: 'Cat', 
        subcategory: 'Sub', 
        observation: '', 
        filePath: '/file/path' 
      };
      (Arquivo.create as any).mockResolvedValue({ ...req.body, user: '123' });

      // Act
      await createArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ ...req.body, user: '123' });
    });

    it('deve retornar 400 se faltar campos obrigatórios', async () => {
      // Arrange
      req.body = { title: 'Doc' }; // incompleto

      // Act
      await createArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Campos obrigatórios faltando.' });
    });
  });

  // deleteArquivo
  describe('deleteArquivo', () => {
    it('deve deletar arquivo com usuário correto', async () => {
      // Arrange
      const mockArquivo = { user: '123', deleteOne: jest.fn().mockResolvedValue(undefined) };
      (Arquivo.findById as any).mockResolvedValue(mockArquivo);

      // Act
      await deleteArquivo(req, res);

      // Assert
      expect(mockArquivo.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'abc', message: 'Arquivo removido com sucesso' });
    });

    it('deve retornar 404 se arquivo não existir', async () => {
      // Arrange
      (Arquivo.findById as any).mockResolvedValue(null);

      // Act
      await deleteArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Arquivo não encontrado' });
    });

    it('deve retornar 401 se usuário não autorizado', async () => {
      // Arrange
      const mockArquivo = { user: '999', deleteOne: jest.fn() };
      (Arquivo.findById as any).mockResolvedValue(mockArquivo);

      // Act
      await deleteArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autorizado a excluir este arquivo.' });
    });
  });

  // updateArquivo
  describe('updateArquivo', () => {
    it('deve atualizar título e valor de um arquivo', async () => {
      // Arrange
      req.body = { title: 'Novo Título', value: 200 };
      const mockArquivo = { user: '123', save: jest.fn().mockResolvedValue(undefined), title: '', value: 0 };
      (Arquivo.findById as any).mockResolvedValue(mockArquivo);

      // Act
      await updateArquivo(req, res);

      // Assert
      expect(mockArquivo.save).toHaveBeenCalled();
      expect(mockArquivo.title).toBe('Novo Título');
      expect(mockArquivo.value).toBe(200);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockArquivo);
    });

    it('deve retornar 400 se não informar title ou value', async () => {
      // Arrange
      req.body = {};

      // Act
      await updateArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Informe pelo menos um campo para atualizar' });
    });

    it('deve retornar 404 se arquivo não existir', async () => {
      // Arrange
      (Arquivo.findById as any).mockResolvedValue(null);
      req.body = { title: 'Novo' };

      // Act
      await updateArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Arquivo não encontrado' });
    });

    it('deve retornar 401 se usuário não autorizado', async () => {
      // Arrange
      const mockArquivo = { user: '999', save: jest.fn() };
      (Arquivo.findById as any).mockResolvedValue(mockArquivo);
      req.body = { title: 'Novo' };

      // Act
      await updateArquivo(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Não autorizado.' });
    });
  });
});
