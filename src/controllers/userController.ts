import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';
import User from '../models/userModel.js';
import { IAuthRequest } from '../interfaces/IAuthRequest.js';
import { IUserBody, IChangePasswordBody } from '../interfaces/IUserRequest.js';
import { logger } from '../utils/logger.js';

/**
 * @openapi
 * tags:
 * - name: Usuários
 * description: Cadastro, login e gerenciamento de usuários
 */

// --- A. READ ---
export const getUserProfile = async (req: IAuthRequest, res: Response) => {
  const profileId = req.params.id;
  const authenticatedUserId = req.user?.id;

  logger.info('Iniciando busca de perfil', { route: req.originalUrl, userId: authenticatedUserId });

  if (!profileId || !authenticatedUserId) {
    return res.status(400).json({
      message: 'ID do perfil ou usuário autenticado não encontrado.'
    });
  }

  if (profileId !== authenticatedUserId) {
    logger.error('Tentativa de acesso proibido ao perfil', {
      route: req.originalUrl,
      userId: authenticatedUserId,
      requestedId: profileId
    });

    return res.status(403).json({ message: 'Acesso proibido.' });
  }

  try {
    const user = await userService.getProfileById(profileId);
    if (!user) {
      logger.info('Perfil não encontrado', { route: req.originalUrl, userId: authenticatedUserId });
      return res.status(404).json({ message: 'Perfil não encontrado.' });
    }

    logger.info('Perfil encontrado', { route: req.originalUrl, userId: authenticatedUserId });
    res.status(200).json(user);
  } catch (error: any) {
    logger.error('Erro ao buscar perfil', {
      message: error.message,
      stack: error.stack,
      route: req.originalUrl,
      method: req.method,
      userId: authenticatedUserId,
      body: req.body
    });
    res.status(500).json({ message: 'Erro interno ao buscar perfil.' });
  }
};

// --- B. UPDATE ---
export const updateUserProfile = async (req: IAuthRequest, res: Response) => {
  const profileId = req.params.id;
  const authenticatedUserId = req.user?.id;

  logger.info('Iniciando atualização de perfil', {
    route: req.originalUrl,
    userId: authenticatedUserId
  });

  if (!profileId || !authenticatedUserId) {
    logger.error('Dados de identificação ausentes', {
      route: req.originalUrl,
      method: req.method
    });

    return res.status(400).json({ message: 'Dados de identificação ausentes.' });
  }


  if (profileId !== authenticatedUserId) {
    logger.error('Tentativa de atualização não autorizada', {
      route: req.originalUrl,
      userId: authenticatedUserId,
      requestedId: profileId
    });

    return res.status(403).json({
      message: "Acesso Proibido. Você só pode atualizar seu próprio perfil."
    });
  }

  try {
    const body: IUserBody = req.body;


    if (!body || Object.keys(body).length === 0) {
      logger.error('Nenhum dado enviado para atualização', {
        route: req.originalUrl,
        userId: profileId
      });

      return res.status(400).json({ message: 'Nenhum dado enviado para atualização.' });
    }


    if (body.email && !body.email.includes('@')) {
      logger.error('Email inválido na atualização', {
        route: req.originalUrl,
        userId: profileId,
        email: body.email
      });

      return res.status(400).json({ message: 'Email inválido.' });
    }

    const updatedUser = await userService.updateProfileById(profileId, body);

    if (!updatedUser) {
      logger.error('Perfil não encontrado para atualização', {
        route: req.originalUrl,
        userId: profileId
      });

      return res.status(404).json({ message: 'Perfil de usuário não encontrado.' });
    }

    logger.info('Perfil atualizado com sucesso', {
      route: req.originalUrl,
      userId: profileId,
      updatedFields: Object.keys(body)
    });

    res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      data: updatedUser
    });

  } catch (error: any) {
    logger.error('Erro ao atualizar perfil', {
      message: error.message,
      stack: error.stack,
      route: req.originalUrl,
      method: req.method,
      userId: profileId,
      body: req.body
    });

    res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
  }
};

export const changePassword = async (req: IAuthRequest, res: Response) => {
  const { currentPassword, newPassword }: IChangePasswordBody = req.body;
  const userEmail = req.user?.email;

  logger.info('Iniciando alteração de senha', { userEmail });

  if (!userEmail) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senhas atual e nova são obrigatórias.' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.senha);
    if (!isMatch) {
      logger.error('Senha atual incorreta', {
        userEmail,
        route: req.originalUrl,
        method: req.method
      });

      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.senha = hashedPassword;
    await user.save();

    logger.info('Senha alterada com sucesso', { userEmail });

    res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    logger.error('Erro ao alterar senha', {
      message: err instanceof Error ? err.message : 'Erro desconhecido',
      stack: err instanceof Error ? err.stack : undefined,
      route: req.originalUrl,
      method: req.method,
      userEmail
    });
    res.status(500).json({ message: 'Erro ao alterar senha.' });
  }
};

// --- C. DELETE ---
export const deleteUser = async (req: IAuthRequest, res: Response) => {
  const profileId = req.params.id;
  const authenticatedUserId = req.user?.id;

  logger.info('Iniciando exclusão de perfil', { route: req.originalUrl, userId: authenticatedUserId });

  if (!profileId || !authenticatedUserId) {
    return res.status(400).json({ message: 'Dados de identificação ausentes.' });
  }

  if (profileId !== authenticatedUserId) {
    logger.info('Tentativa de exclusão não autorizada', { route: req.originalUrl, userId: authenticatedUserId });
    return res.status(403).json({
      message: "Acesso Proibido. Você só pode deletar seu próprio perfil."
    });
  }

  try {
    const wasDeleted = await userService.deleteProfileById(profileId);
    if (!wasDeleted) {
      return res.status(404).json({ message: 'Perfil não encontrado para exclusão.' });
    }

    logger.info('Perfil deletado com sucesso', { userId: profileId });

    res.status(204).send();
  } catch (error: any) {
    logger.error('Erro ao deletar perfil', {
      message: error.message,
      stack: error.stack,
      route: req.originalUrl,
      method: req.method,
      userId: profileId
    });
    res.status(500).json({ message: 'Erro ao tentar deletar o perfil.' });
  }
};

// --- D. ROTA INTERNA ---
export const createProfileInternal = async (req: IAuthRequest, res: Response) => {
  const { nome, email, senha }: IUserBody = req.body;

  logger.info('Iniciando criação de perfil interno', { route: req.originalUrl, body: req.body });

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const newProfile = await userService.createProfile(email, nome, senha);

    logger.info('Perfil criado com sucesso', { email });

    res.status(201).json({
      message: 'Perfil criado com sucesso.',
      user: newProfile
    });
  } catch (err: any) {
    if (err.message.includes('existe')) {
      return res.status(409).json({ message: 'Perfil já existe.' });
    }
    logger.error('Erro ao criar perfil', {
      message: err.message,
      stack: err.stack,
      route: req.originalUrl,
      method: req.method,
      body: req.body
    });
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- E. OBTÉM DADOS PELO TOKEN ---
export const getUserByToken = async (req: IAuthRequest, res: Response) => {
  logger.info('Buscando usuário pelo token', { route: req.originalUrl });

  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    const user = await User.findOne({ email: userEmail }).select('nome email');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    logger.info('Usuário encontrado via token', { userEmail });

    res.status(200).json({
      name: user.nome,
      email: user.email
    });
  } catch (err) {
    logger.error('Erro ao buscar usuário pelo token', {
      message: err instanceof Error ? err.message : 'Erro desconhecido',
      stack: err instanceof Error ? err.stack : undefined,
      route: req.originalUrl,
      method: req.method
    });
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

// ==========================
// 🔑 FUNÇÃO: GERAR TOKEN JWT
// ==========================
const generateToken = (email: string, id: string, nome: string) => {
  return jwt.sign({ email, id, nome }, process.env.JWT_SECRET || 'secret', { expiresIn: '6h' });
};

// ==========================
// 🔐 LOGIN DE USUÁRIO
// ==========================
export const loginUser = async (req: any, res: Response) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciais inválidas.' });

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ message: 'Credenciais inválidas.' });

    const token = generateToken(user.email, (user._id as any).toString(), user.nome);

    logger.info("Login bem-sucedido", { email: user.email, userId: user._id });

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: { id: user._id, nome: user.nome, email: user.email },
      token,
    });
  } catch (err: any) {
    logger.error("Falha no login", { email, error: err.message });
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// ==========================
// 🧾 REGISTRO DE USUÁRIO
// ==========================
export const registerUser = async (req: any, res: Response) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = await userService.createProfile(email, nome, hashedPassword);
    const token = generateToken(newUser.email, (newUser._id as any).toString(), newUser.nome);

    logger.info("Novo usuário registrado", { email: newUser.email, userId: newUser._id });

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: { id: newUser._id, nome: newUser.nome, email: newUser.email },
      token,
    });
  } catch (err: any) {
    logger.error("Falha no registro", { email, error: err.message });
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};