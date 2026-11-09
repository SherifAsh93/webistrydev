#!/usr/bin/env tsx
/**
 * Facebook Auto-Post Script for WebistryDev
 * Reads credentials from .env.local and posts to the Facebook page.
 * Usage: npx tsx scripts/facebook-sync.ts [message] [link] [imageUrl]
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..", "..");

// Load .env.local
function loadEnv(): Record<string, string> {
  const envPath = resolve(__dirname, ".env.local");
  const content = readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      env[key] = rest.join("=");
    }
  }
  return env;
}

const env = loadEnv();

const FB_APP_ID = env.FB_APP_ID;
const FB_APP_SECRET = env.FB_APP_SECRET;
const FB_PAGE_ID = env.FB_PAGE_ID;
const FB_PAGE_TOKEN = env.FB_PAGE_TOKEN;

function validateEnv() {
  const missing = [
    !FB_APP_ID && "FB_APP_ID",
    !FB_APP_SECRET && "FB_APP_SECRET",
    !FB_PAGE_ID && "FB_PAGE_ID",
    !FB_PAGE_TOKEN && "FB_PAGE_TOKEN",
  ].filter(Boolean);
  if (missing.length) {
    console.error("❌ Missing required env vars:", missing.join(", "));
    console.error("   Fill them in /home/sherif/sites/webistrydev/.env.local");
    process.exit(1);
  }
}

async function postToFacebook(message: string, link?: string, imageUrl?: string) {
  validateEnv();

  const graphUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;
  const params = new URLSearchParams({
    access_token: FB_PAGE_TOKEN,
    message,
  });
  if (link) params.set("link", link);
  if (imageUrl) params.set("picture", imageUrl);

  try {
    const response = await fetch(graphUrl, {
      method: "POST",
      body: params,
    });
    const data = await response.json();
    if (data.error) {
      console.error("❌ Facebook API error:", data.error.message);
      process.exit(1);
    }
    console.log("✅ Posted to Facebook:", data.id);
    return data.id;
  } catch (err) {
    console.error("❌ Network error:", (err as Error).message);
    process.exit(1);
  }
}

// CLI usage
const [,, message, link, imageUrl] = process.argv;
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!message) {
    console.log("Usage: npx tsx scripts/facebook-sync.ts \"message\" [link] [imageUrl]");
    console.log("Example: npx tsx scripts/facebook-sync.ts \"🚀 New project: MyApp\" \"https://myapp.webistrydev.com\" \"https://example.com/screenshot.png\"");
    process.exit(1);
  }
  postToFacebook(message, link, imageUrl);
}

export { postToFacebook, loadEnv };