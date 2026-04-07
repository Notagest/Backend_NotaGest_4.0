import { Response } from 'express';
import bcrypt from 'bcryptjs';
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
  if (!profileId || !authenticatedUserId) {
    return res.status(400).json({ 
      message: 'ID do perfil ou usuário autenticado não encontrado.' 
    });
  }

  if (profileId !== authenticatedUserId) {
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

  // Type Guard: Resolve o erro de string | undefined
  if (!profileId || !authenticatedUserId) {
    return res.status(400).json({ message: 'Dados de identificação ausentes.' });
  }

  if (profileId !== authenticatedUserId) {
    return res.status(403).json({
      message: "Acesso Proibido. Você só pode atualizar seu próprio perfil."
    });
  }

  try {
    const body: IUserBody = req.body;
    const updatedUser = await userService.updateProfileById(profileId, body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Perfil de usuário não encontrado.' });
    }

    res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      data: updatedUser
    });
    logger.info('Perfil atualizado com sucesso', { route: req.originalUrl, userId: profileId, updatedFields: Object.keys(req.body) });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error.message);
    res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
  }
};

export const changePassword = async (req: IAuthRequest, res: Response) => {
  const { currentPassword, newPassword }: IChangePasswordBody = req.body;
  const userEmail = req.user?.email;

  // Verificação de segurança para o e-mail
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
    if (!isMatch) return res.status(400).json({ message: 'Senha atual incorreta.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.senha = hashedPassword;
    await user.save();
    logger.info('Senha alterada com sucesso', { userEmail });

    res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao alterar senha.' });
  }
};

// --- C. DELETE ---
export const deleteUser = async (req: IAuthRequest, res: Response) => {
  const profileId = req.params.id;
  const authenticatedUserId = req.user?.id;

  // Type Guard: Resolve o erro de string | undefined
  if (!profileId || !authenticatedUserId) {
    return res.status(400).json({ message: 'Dados de identificação ausentes.' });
  }

  if (profileId !== authenticatedUserId) {
    return res.status(403).json({
      message: "Acesso Proibido. Você só pode deletar seu próprio perfil."
    });
  }

  try {
    const wasDeleted = await userService.deleteProfileById(profileId);
    if (!wasDeleted) {
      return res.status(404).json({ message: 'Perfil não encontrado para exclusão.' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar perfil:', error.message);
    res.status(500).json({ message: 'Erro ao tentar deletar o perfil.' });
  }
};

// --- D. ROTA INTERNA ---
export const createProfileInternal = async (req: IAuthRequest, res: Response) => {
  const { nome, email, senha }: IUserBody = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const newProfile = await userService.createProfile(email, nome, senha);
    res.status(201).json({ 
      message: 'Perfil criado com sucesso.', 
      user: newProfile 
    });
  } catch (err: any) {
    if (err.message.includes('existe')) {
      return res.status(409).json({ message: 'Perfil já existe.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- E. OBTÉM DADOS PELO TOKEN ---
export const getUserByToken = async (req: IAuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;

    // Verificação para garantir que userEmail não é undefined
    if (!userEmail) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    const user = await User.findOne({ email: userEmail }).select('nome email');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      name: user.nome,
      email: user.email
    });
  } catch (err) {
    console.error('Erro ao buscar o usuário.', err);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};