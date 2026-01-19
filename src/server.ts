import index from "../index.html";

const server = Bun.serve({
  port: 0, // Auto-assign available port
  routes: {
    "/": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at http://localhost:${server.port}`);
