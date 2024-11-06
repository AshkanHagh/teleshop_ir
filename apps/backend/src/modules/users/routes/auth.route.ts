import { Hono } from 'hono';
import { validationMiddleware } from '@shared/middlewares/validation';
import { telegramInitHashData } from '../schema';
import { validateAndInitializeUser, refreshToken } from '../controllers/auth.controller';
import { every, some } from 'hono/combine';
import rateLimit from '@shared/middlewares/rateLimit';

const authRouter = new Hono();

authRouter.post('/pol-barzakh', some(every(rateLimit(1000 * 60 * 15, 5), validationMiddleware('json', telegramInitHashData))),
    validateAndInitializeUser
);

authRouter.get('/refresh', rateLimit(1000 * 60 * 5, 1), refreshToken);

export default authRouter;