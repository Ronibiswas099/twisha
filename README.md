# Twisha secure dashboard proxy

This Vercel project gives the existing Twisha dashboard a secure public URL.

## Deploy

1. Upload this folder to a new Vercel project, then deploy it again whenever this package is updated.
2. In **Project Settings → Environment Variables**, add:

   ```text
   DASHBOARD_ORIGIN = http://132.243.253.240:6298
   ```

3. Redeploy the project.
4. In **Project Settings → Domains**, add `dashboard.twisha.com`.
5. On the bot host, change the dashboard settings to:

   ```text
   DASHBOARD_PUBLIC_URL=https://dashboard.twisha.com
   DASHBOARD_REDIRECT_URI=https://dashboard.twisha.com/auth/callback
   ```

6. In Discord Developer Portal → OAuth2 → Redirects, add:

   ```text
   https://dashboard.twisha.com/auth/callback
   ```

Keep the bot dashboard online on port 6298.
