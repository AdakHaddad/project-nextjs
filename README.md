This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

### Deploying with Supabase (Postgres) and Vercel

If you plan to host the database on Supabase and the app on Vercel, follow these recommended steps:

1. **Create a Supabase project** at https://app.supabase.com and copy the Postgres connection string from Project → Settings → Database → Connection string.

2. **Set Environment Variables in Vercel** project settings (Production and Preview as needed):
   - `DATABASE_URL` — the Postgres connection string from Supabase
   - `NEXTAUTH_URL` — your Vercel app URL (e.g. `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` — a long random secret (64 bytes hex). Generate with:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Optional: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` if your app uses Supabase client/server features.

3. **Apply Prisma migrations to Supabase**. You can run this locally (recommended once) or via CI after adding `DATABASE_URL` as a secret:
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:YOUR_PASS@db.<project>.supabase.co:5432/postgres"
   npx prisma migrate deploy
   ```

4. **Vercel build**: this project runs `prisma generate` as part of the `build` script and also runs it on `postinstall` to ensure Prisma Client exists during runtime.

5. **Verify authentication and DB features** in your deployed site. Make sure `NEXTAUTH_URL` is set to your Vercel URL (not Netlify) so authentication callbacks work correctly.

**Note**: Your current `.env` has `NEXTAUTH_URL="https://simdosma.netlify.app"`. If deploying to Vercel, update this to your Vercel app URL in the Vercel environment variables.

