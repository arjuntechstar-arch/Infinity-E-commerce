import { Router } from 'express';
import productsRouter from './routes/products';
import schemesRouter from './routes/schemes';
import ordersRouter from './routes/orders';
import warrantiesRouter from './routes/warranties';
import paymentsRouter from './routes/payments';
import kycRouter from './routes/kyc';
import profileRouter from './routes/profile';
import conciergeRouter from './routes/concierge';
import vouchersRouter from './routes/vouchers';
import hubsRouter from './routes/hubs';

const apiRouter = Router();

apiRouter.use('/products', productsRouter);
apiRouter.use('/schemes', schemesRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/warranties', warrantiesRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/kyc', kycRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/concierge', conciergeRouter);
apiRouter.use('/vouchers', vouchersRouter);
apiRouter.use('/hubs', hubsRouter);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VoltMart Electronics & Schemes API',
    version: '1.0.0',
  });
});

export default apiRouter;
