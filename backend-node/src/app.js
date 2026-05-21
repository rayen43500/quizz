import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '3mb' }));

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' },
});
app.use('/api/v1/auth', authLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'quisi-api', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
