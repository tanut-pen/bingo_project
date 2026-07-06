export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve runtime config variables to the frontend dynamically
    if (url.pathname === "/api/config") {
      const config = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: env.VITE_FIREBASE_DATABASE_URL,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
      };
      
      return new Response(JSON.stringify(config), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    const response = await env.ASSETS.fetch(request);
    
    // SPA Fallback: If asset is not found, serve index.html
    if (response.status === 404) {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    
    return response;
  }
};
