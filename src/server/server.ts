// Import the framework and instantiate it
import Fastify from "fastify";
import { routesHealthGet } from "src/routes/health/routes_health_get.js";
import { routesRootPost } from "src/routes/root/routes_root_post.js";

const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get("/", async function handler(request, reply) {
  return { hello: "world" };
});

fastify.post("/", async function handler(request, reply) {
  return routesRootPost;
});

fastify.get("/health", async function handler(request, reply) {
  return routesHealthGet();
});

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
