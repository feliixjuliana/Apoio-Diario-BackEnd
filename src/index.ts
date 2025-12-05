import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import userRoutes from './routes/user-routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('API Apoio Diário rodando!');
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});