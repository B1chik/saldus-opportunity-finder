# Saldus Opportunity Finder — deploy-ready AI version

This preserves the existing premium prototype and replaces its offline chat response handler with a real AI call via `/api/chat`.

## Deploy with Vercel
1. Connect Vercel in ChatGPT or sign in to Vercel and create a project from this folder/repository.
2. Set the **server-side** environment variable `OPENAI_API_KEY` in the Vercel project settings. Never place the key in HTML or commit it to Git.
3. Deploy (framework preset: Other; root directory: this project). `index.html` is the homepage; `api/chat.js` is the serverless endpoint.
4. Open the deployed HTTPS URL, test the AI button and multilingual chat.

Optional: `OPENAI_MODEL=gpt-4.1-mini` (default). API usage incurs charges separately from ChatGPT subscriptions.

## Notes
- All 32 courses remain **fictional examples**; AI never has live course data.
- The assistant keeps the last 12 conversation messages in browser memory until reload; no database is included.
- Before public promotion, add authentication or abuse protection, rate limits, spending caps and monitoring to control API cost. Add privacy information and retention policies if storing chats.
- A standalone local `index.html` opened as `file://` cannot use the serverless AI route; it must be deployed.
- No API key is included.
