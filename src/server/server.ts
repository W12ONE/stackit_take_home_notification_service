// Import the framework and instantiate it
import Fastify from "fastify";
import { routesHealthGet } from "../routes/health/routes_health_get.js";
import {
  routesRootPost,
  type RootPostRequest,
} from "../routes/root/routes_root_post.js";

const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get("/", async function handler(request, reply) {
  return { hello: "world" };
});

fastify.post("/", async function handler(request, reply) {
  const functionReply = await routesRootPost(request.body as RootPostRequest); // TODO: validate type since Fastify only does JSON by default and use zod for runtime validation. Currently this is kinda iffy with capitalised keys
  return reply
    .code(functionReply.code)
    .header(functionReply.header.headerType, functionReply.header.headerValue)
    .send(functionReply.send);
});

fastify.get("/health", async function handler(request, reply) {
  const functionReply = await routesHealthGet();
  return reply
    .code(functionReply.code)
    .header(functionReply.header.headerType, functionReply.header.headerValue)
    .send(functionReply.send);
});

// Run the server!
export const startServer = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
