import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  try {
    return await handler.GET(req);
  } catch (e: any) {
    console.error("[auth GET]", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    return await handler.POST(req);
  } catch (e: any) {
    console.error("[auth POST]", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
