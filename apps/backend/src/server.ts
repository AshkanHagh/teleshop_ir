import app from './app';

Bun.serve({
    port : process.env.PORT || 4188,
    fetch : app.fetch
});