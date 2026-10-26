# EL AI Video Generator v0.2 — real text AI backend

## What this version does
- Responsive app interface suitable for Android browser
- Express backend
- Server-side Hugging Face Inference Providers chat-completions call
- Script/scene-plan generation endpoint
- Copy/download output
- API token stays on server via environment variable `HF_TOKEN`

## Important
This is a real AI text integration, not video generation yet. It does not yet make video clips, generate voice files, or render MP4. Next build stage will add a video provider adapter and voice service, then a render/assembly job.

Hugging Face free credits and model/provider availability can change. Check current account quota and selected model. This app does not bypass quotas or provider costs.

## Deploy from Android (no terminal required)
1. Create a GitHub account if you do not already have one.
2. Create a new private repository named `el-ai-video-generator`.
3. Upload the files in this project to the repository root (keep the `public` folder).
4. Create a Render account and choose **New → Web Service**.
5. Connect the GitHub repository.
6. Use build command: `npm install`
7. Use start command: `npm start`
8. Select a free instance for testing if available.
9. In Render's service dashboard open **Environment** and add:
   - Key: `HF_TOKEN`
   - Value: your Hugging Face user access token with Inference Providers permission
   - Optional key `HF_MODEL`, value `Qwen/Qwen2.5-7B-Instruct` (change if this model is unavailable to your account/provider)
10. Save and deploy. Wait for deployment to finish, then open the Render URL.
11. Tap **Check connection**, enter a story idea, and tap **Generate with AI**.

## Secret safety
- Never put `HF_TOKEN` in `public/index.html`.
- Never commit `.env` or tokens to GitHub.
- Do not share the token in chat.
- If exposed, revoke it immediately and create a replacement.
- Keep provider usage limits/billing controls enabled where available.

## Files
- `server.js`: Express API and server-side provider call
- `public/index.html`: EL UI
- `package.json`: app dependencies and start command
