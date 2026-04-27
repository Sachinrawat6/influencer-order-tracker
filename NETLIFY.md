# Netlify Deploy

## One-time setup

1. **Create the site**: Netlify → Add new site → Import from Git → pick the
   frontend repo / folder.

2. **Build settings** (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment variables** (Site settings → Environment variables):

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://cutting-qrcode-api.qurvii.com` (prod) or `https://staging-cutting-qrcode-api.qurvii.com` (staging) |

   `api.js` auto-appends `/api`, so both `https://...qurvii.com` and
   `https://...qurvii.com/api` work.

4. **Whitelist the Netlify URL on the backend**: tell deploy.yml about your
   Netlify origin so CORS doesn't block requests. Edit
   `.github/workflows/deploy.yml` in the backend repo:

   ```yaml
   # main branch (prod)
   echo "ALLOWED_ORIGINS=https://influencer-order-tracker.qurvii.com,https://YOUR-SITE.netlify.app" >> $GITHUB_ENV

   # dev branch (staging)
   echo "ALLOWED_ORIGINS=https://staging-influencer-order-tracker.qurvii.com,https://YOUR-SITE.netlify.app,http://localhost:5173" >> $GITHUB_ENV
   ```

   Then push to `main` / `dev` to redeploy the backend with the new origin.

5. **Trigger a Netlify build**: push to the connected branch or click
   **Trigger deploy → Clear cache and deploy site**.

## Why login fails without the above

- No `VITE_API_BASE_URL` → axios sends `/api/auth/login` to the Netlify
  origin → 404.
- Netlify URL not in `ALLOWED_ORIGINS` → CORS preflight blocks the request →
  toast says "Network Error" or the call silently fails.
- No `_redirects` / `netlify.toml` SPA rule → refreshing on `/login` returns
  a Netlify 404 page (login still works on first load, but breaks on
  bookmarks / refreshes).

## Verify the deploy

After deploy, open the site, hit Login, watch the browser DevTools Network
tab. The `POST /api/auth/login` call should:

1. Go to `https://cutting-qrcode-api.qurvii.com/api/auth/login`
2. Have an `Origin` header matching your Netlify URL
3. Return `200` with `{ "success": true, "data": { "token": "..." } }`

If you see `(failed)` or `CORS error` — fix step 4 above.
If you see `404` — fix step 3 (`VITE_API_BASE_URL`).
