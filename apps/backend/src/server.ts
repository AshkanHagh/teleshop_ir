import { env } from '../env';
import app from './app';

Bun.serve({
    port : env.PORT || 4188,
    fetch : app.fetch
});