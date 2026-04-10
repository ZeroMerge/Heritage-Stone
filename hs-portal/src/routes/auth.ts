// hs-portal/src/routes/auth.ts
// Handles password-protected brand portal login flow.
// GET  /auth/login/:slug  — renders a branded login form
// POST /auth/login/:slug  — validates password, sets session cookie, redirects to portal

import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { getBrandMeta } from "../lib/hydrator.js";
import { logger } from "../lib/logger.js";

export const authRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

authRouter.get("/login/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const brand = await getBrandMeta(slug).catch(() => null);
  if (!brand) return res.status(404).send("Brand not found");

  const failed = req.query.failed === "1";
  res.send(loginPage(brand.brand_name, slug, failed));
});

authRouter.get("/login-account", async (req: Request, res: Response) => {
  const redirect = req.query.redirect as string || "/";
  res.send(accountLoginPage(redirect));
});

authRouter.post("/set-token", async (req: Request, res: Response) => {
  const { access_token, refresh_token } = req.body;
  
  if (!access_token) {
    return res.status(400).json({ ok: false, error: "Missing token" });
  }

  res.cookie("sb-access-token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7 * 1000 // 1 week
  });

  return res.json({ ok: true });
});

authRouter.post("/login/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { password } = req.body as { password?: string };

  const brand = await getBrandMeta(slug).catch(() => null);
  if (!brand) return res.status(404).send("Brand not found");

  if (!brand.password_protected || !brand.password_hash) {
    return res.redirect(`/portal/${slug}`);
  }

  // Security: Use bcrypt for password comparison
  const isMatch = password ? await bcrypt.compare(password, brand.password_hash) : false;
  
  if (isMatch) {
    (req.session as any).authenticatedSlug = slug;
    logger.info(`[auth] Login success for slug: ${slug}`);
    return res.redirect(`/portal/${slug}`);
  }

  logger.warn(`[auth] Login failed for slug: ${slug}`);
  return res.redirect(`/auth/login/${slug}?failed=1`);
});

function accountLoginPage(redirect: string): string {
  return `<!DOCTYPE html><html><head>
  <title>Heritage Stone — Login</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#e8e8e8;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{width:100%;max-width:400px;padding:2.5rem;background:#111;border:1px solid #242424;}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:1rem;color:#c9a96e}
    p{font-size:.875rem;color:#888;margin-bottom:2rem}
    .field{margin-bottom:1.25rem}
    label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#666;margin-bottom:0.5rem;font-weight:700}
    input{width:100%;padding:.75rem;background:#0a0a0a;border:1px solid #242424;color:#e8e8e8;font-size:.875rem;outline:none;}
    input:focus{border-color:#c9a96e}
    button{width:100%;padding:.75rem;background:#c9a96e;color:#000;font-weight:700;font-size:.875rem;border:none;cursor:pointer;transition:all 0.2s;}
    button:hover{background:#a0824e}
    button:disabled{opacity:0.5;cursor:not-allowed}
    #error{color:#ef4444;font-size:.75rem;margin-top:1rem;display:none;padding:0.75rem;background:rgba(239, 68, 68, 0.1);border:1px solid rgba(239, 68, 68, 0.2)}
  </style>
</head><body>
  <div class="card">
    <h1>Heritage Stone</h1>
    <p>Sign in with your studio account to access the portal.</p>
    
    <div class="field">
      <label>Email Address</label>
      <input type="email" id="email" placeholder="name@company.com" required />
    </div>
    
    <div class="field">
      <label>Password</label>
      <input type="password" id="password" placeholder="••••••••" required />
    </div>

    <button id="loginBtn">Login</button>
    <div id="error"></div>
  </div>

  <script>
    const supabaseUrl = "${process.env.SUPABASE_URL}";
    const supabaseKey = "${process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY}";
    const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('error');

    loginBtn.onclick = async () => {
      errorDiv.style.display = 'none';
      loginBtn.disabled = true;
      loginBtn.innerText = 'Verifying...';

      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Set the token on the server side via cookie
        const res = await fetch('/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token 
          })
        });

        if (res.ok) {
          window.location.href = "${decodeURIComponent(redirect)}";
        } else {
          throw new Error('Failed to set session');
        }
      } catch (err) {
        errorDiv.innerText = err.message;
        errorDiv.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerText = 'Login';
      }
    };
  </script>
</body></html>`;
}

function loginPage(brandName: string, slug: string, failed: boolean): string {
  return `<!DOCTYPE html><html><head>
  <title>${brandName} — Access Required</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#e8e8e8;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{width:100%;max-width:360px;padding:2rem;background:#111;border:1px solid #242424;border-radius:8px;}
    h1{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}
    p{font-size:.875rem;color:#888;margin-bottom:1.5rem}
    input{width:100%;padding:.625rem .75rem;background:#0a0a0a;border:1px solid #242424;color:#e8e8e8;border-radius:4px;font-size:.875rem;margin-bottom:1rem;outline:none;}
    input:focus{border-color:#c9a96e}
    button{width:100%;padding:.625rem;background:#c9a96e;color:#000;font-weight:600;font-size:.875rem;border:none;border-radius:4px;cursor:pointer;}
    button:hover{background:#a0824e}
    .err{color:#e05252;font-size:.8125rem;margin-bottom:.75rem}
  </style>
</head><body>
  <div class="card">
    <h1>${brandName}</h1>
    <p>This brand portal is password protected.</p>
    ${failed ? '<p class="err">Incorrect password. Please try again.</p>' : ""}
    <form method="POST" action="/auth/login/${slug}">
      <input type="password" name="password" placeholder="Enter password" autofocus required />
      <button type="submit">Access Portal</button>
    </form>
  </div>
</body></html>`;
}
