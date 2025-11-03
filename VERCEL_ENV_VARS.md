# Vercel Environment Variables

Copy and paste these **EXACT** values into your Vercel project settings:

## Required Environment Variables

### DATABASE_URL
```
postgresql://postgres.mlqssaatasqiaqnjuqbt:passworddatabasefkkmk@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30
```

### DIRECT_URL
```
postgresql://postgres.mlqssaatasqiaqnjuqbt:passworddatabasefkkmk@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?connect_timeout=30
```

### NEXTAUTH_SECRET
```
8b936ad475634c369e8472e7316e6a3679452bb8244d37c947f4b46aeadb0a2c39286d5395aee5f8337d3555ee4a57bc5a1108e388a09b9280e51f677f9d8111
```

### NEXTAUTH_URL
```
https://your-vercel-app-url.vercel.app
```
**Important:** Replace with your actual Vercel deployment URL after first deploy!

### NEXT_PUBLIC_SUPABASE_URL
```
https://mlqssaatasqiaqnjuqbt.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scXNzYWF0YXNxaWFxbmp1cWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjMwNjgsImV4cCI6MjA3NzY5OTA2OH0.ZscM7DIgYqYTIpusgtzhYaUedUU8B2u9b0GULQLc3o8
```

---

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable above:
   - Add the **Name** (e.g., `DATABASE_URL`)
   - Add the **Value** (copy the entire string including parameters)
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. After adding all variables, go to **Deployments** tab
5. Click the **...** menu on the latest deployment
6. Click **Redeploy**

---

## Troubleshooting

If you still get database connection errors:

### Option 1: Use Direct Connection (No Pooling)
Try using the direct connection URL for `DATABASE_URL` instead:
```
postgresql://postgres.mlqssaatasqiaqnjuqbt:passworddatabasefkkmk@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### Option 2: Check Supabase Project Status
- Ensure your Supabase project is **active** (not paused)
- Check connection pooling is enabled in Supabase settings

### Option 3: Verify Password
If the password contains special characters, ensure it's correct.
Current password: `passworddatabasefkkmk`
