# OralCare Deployment Workflow

This guide documents the definitive steps to deploy the A&E OralCare platform on **InsForge**, bypassing environment-specific limitations and monorepo complexities.

---

## 1. Prerequisites
- **InsForge CLI**: Installed and authenticated (`insforge login`).
- **Flyctl**: Required for Backend Compute (`curl -L https://fly.io/install.sh | sh`).
- **Environment Variables**: Must be configured in the InsForge Dashboard (Compute & Deployments).
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `ADMIN_EMAIL`
  - `AI_INTEGRATIONS_OPENAI_API_KEY` (Gemini 2.0 Key)

---

## 2. Backend Deployment (API Server)
The backend is a Node.js Express server deployed as a Docker container on Fly.io (via InsForge Compute).

### Step 2.1: Pre-build Bundle
Always bundle with `esbuild` locally to avoid "Out of Memory" or "Missing dependencies" errors during the remote Docker build.
```bash
pnpm --filter @workspace/api-server exec esbuild src/index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js --format=cjs
```

### Step 2.2: Deploy Compute
Execute from the **root of the workspace** (with the Dockerfile in root):
```bash
# Ensure Dockerfile is in root and points to artifacts/api-server/dist
insforge compute deploy . --name api-server --yes --port 8080
```

---

## 3. Frontend Deployment (OralCare Landing)
The frontend is a React + Vite SPA deployed to Vercel (via InsForge Deployments).

### Step 3.1: Build Locally
Generate the static production files.
```bash
pnpm --filter oralcare-frontend build
```

### Step 3.2: Skip Remote Build
InsForge/Vercel tries to run `vite build` again by default, which fails in monorepos. We force it to use our local `dist` by adding a `vercel.json` in `artifacts/oralcare/dist/public/`:
```json
{
  "buildCommand": "echo 'Skipping build, using pre-built files'",
  "outputDirectory": ".",
  "framework": null
}
```

### Step 3.3: Deploy
Execute the deployment pointing specifically to the static folder:
```bash
insforge deployments deploy artifacts/oralcare/dist/public --yes
```

---

## 4. Database Sync
If the schema changes, sync the production DB:
```bash
DATABASE_URL="your_insforge_db_url" pnpm --filter @workspace/db run push
```

---

## 5. Troubleshooting
- **PATH Issues**: If `pnpm` is not found, use: `export PATH=$PATH:/home/alien/.npm-global/bin`.
- **Flyctl Issues**: If `flyctl` is missing: `export PATH=$PATH:/home/alien/.fly/bin`.
- **Timeout**: The sub-environment might kill long-running uploads. Re-run the command; Fly.io resumes the layer upload.
