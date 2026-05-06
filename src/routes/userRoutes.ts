import { Router, Request, Response } from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/userModel.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Usuários
 * description: Rotas para gerenciamento de usuários
 */

// NOTA: Para as rotas abaixo, o ideal é que essa lógica vá para o Controller futuramente.
// Por enquanto, vamos apenas tipar para funcionar a migração.

/**
 * @swagger
 * /api/users/me:
 * get:
 * summary: Retorna o usuário logado
 * tags: [Usuários]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Usuário encontrado
 */
router.get('/me', protect, async (req: Request, res: Response) => {
  try {
    logger.info('Buscando usuário logado', { route: req.originalUrl });

    const user = await User.findOne({ email: (req as any).user.email }).select('_id nome email');

    if (!user) {
      logger.info('Usuário não encontrado', { route: req.originalUrl });
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    logger.info('Usuário retornado com sucesso', { route: req.originalUrl });

    res.json(user);
  } catch (error: any) {
    logger.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

/**
 * @swagger
 * /api/users/byEmail/{email}:
 * get:
 * summary: Busca usuário pelo e-mail
 * tags: [Usuários]
 */
router.get('/byEmail/:email', async (req: Request, res: Response) => {
  try {
    logger.info('Buscando usuário por email', { 
      route: req.originalUrl,
      email: req.params.email
    });

    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      logger.info('Usuário não encontrado por email', { 
        route: req.originalUrl,
        email: req.params.email
      });
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    logger.info('Usuário encontrado por email', { 
      route: req.originalUrl,
      email: req.params.email
    });

    res.json(user);
  } catch (err) {
    logger.error('Erro ao buscar usuário por email', {
      route: req.originalUrl,
      method: req.method
    });

    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
});

// As rotas abaixo já chamam o controller, o que é o padrão correto
router.put('/change-password', protect, userController.changePassword);
router.post('/internal', userController.createProfileInternal);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/:id', protect, userController.getUserProfile);
router.put('/:id', protect, userController.updateUserProfile);
router.delete('/:id', protect, userController.deleteUser);
router.get('/', (req, res) => {
  res.json({ message: 'Tá rodando' });
});

export default router;