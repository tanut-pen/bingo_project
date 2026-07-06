export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    
    // SPA Fallback: If asset is not found, serve index.html
    if (response.status === 404) {
      const url = new URL(request.url);
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    
    return response;
  }
};
