export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); 
    // e.g. /beats/song1.wav → "beats/song1.wav"

    // ============================
    //  FILE UPLOAD (PUT)
    // ============================
    if (request.method === "PUT") {
      await env.R2_BUCKET.put(key, request.body);
      return Response.json({
        success: true,
        key: key,
        public_url: `${url.origin}/${key}`
      });
    }

    // ============================
    //  FILE DOWNLOAD (GET)
    // ============================
    if (request.method === "GET") {
      const obj = await env.R2_BUCKET.get(key);

      if (!obj) {
        return new Response("File not found", { status: 404 });
      }

      return new Response(obj.body, {
        headers: {
          "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000"
        }
      });
    }

    // Unsupported
    return new Response("Method not allowed", { status: 405 });
  }
};
