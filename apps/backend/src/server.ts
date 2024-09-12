import app from './app';

Bun.serve({
    port : process.env.PORT || 6610,
    fetch : app.fetch
});