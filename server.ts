import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent'
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/apple/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID || 'APPLE_CLIENT_ID_PLACEHOLDER',
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post'
    });
    const authUrl = `https://appleid.apple.com/auth/authorize?${params}`;
    res.json({ url: authUrl });
  });

  // Unified callback handler
  app.all('/auth/callback', (req, res) => {
    // In a real app, you'd exchange the code for tokens here
    // For this demo, we'll just signal success back to the opener
    res.send(`
      <html>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background: #f8fafc;">
          <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="color: #8B4496;">Authentication Successful!</h2>
            <p style="color: #64748b;">This window will close automatically.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
