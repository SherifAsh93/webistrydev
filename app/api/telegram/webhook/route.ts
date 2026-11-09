import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "webistrydev-webhook-secret";

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return { ok: false, error: "No bot token" };
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("[Telegram] Send failed:", error);
    return { ok: false, error: String(error) };
  }
}

async function executeCommand(command: string, args: string[]): Promise<string> {
  const { exec } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execAsync = promisify(exec);

  try {
    switch (command) {
      case "status": {
        const project = args[0] || "all";
        if (project === "all" || project === "webistrydev") {
          const { stdout } = await execAsync("pm2 jlist 2>/dev/null || echo 'pm2 not available'");
          const processes = JSON.parse(stdout).filter((p: any) => p.name.includes("webistry") || p.name.includes("ahmed") || p.name.includes("orbany") || p.name.includes("studio"));
          return processes.map((p: any) => `${p.name}: ${p.pm2_env?.status} (restarts: ${p.pm2_env?.restart_time}, mem: ${Math.round(p.monit?.memory/1024/1024)}MB)`).join("\n") || "No managed processes found";
        }
        return `Unknown project: ${project}`;
      }
      case "deploy": {
        const project = args[0];
        if (!project) return "Usage: /deploy <project>";
        return `Deploy trigger for ${project} — implement your deploy logic here (git pull, build, pm2 restart)`;
      }
      case "restart": {
        const project = args[0];
        if (!project) return "Usage: /restart <project>";
        const { stdout, stderr } = await execAsync(`pm2 restart ${project} 2>&1`);
        return stdout || stderr || `Restarted ${project}`;
      }
      case "logs": {
        const project = args[0];
        const lines = args[1] || "50";
        if (!project) return "Usage: /logs <project> [lines]";
        const { stdout } = await execAsync(`pm2 logs ${project} --lines ${lines} --nostream 2>&1`);
        return stdout.slice(0, 3000);
      }
      case "build": {
        const project = args[0];
        if (!project) return "Usage: /build <project>";
        return `Build trigger for ${project} — implement your build logic here`;
      }
      default:
        return `Unknown command: /${command}. Use /help for available commands.`;
    }
  } catch (error) {
    return `Error executing /${command}: ${String(error)}`;
  }
}

export async function POST(request: NextRequest) {
  // Verify secret token
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== WEBHOOK_SECRET) {
    console.warn("[Telegram Webhook] Invalid secret token");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await request.json();
    const message = update.message || update.edited_message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const text = message.text || "";
    const fromId = String(message.from?.id);

    // Authorization: only admin chat ID can use the bot
    if (chatId !== ADMIN_CHAT_ID && fromId !== ADMIN_CHAT_ID) {
      await sendTelegramMessage(chatId, "🚫 Unauthorized. This bot is for admin use only.");
      return NextResponse.json({ ok: true });
    }

    // Handle commands
    if (text.startsWith("/")) {
      const parts = text.trim().split(/\s+/);
      const command = parts[0].slice(1).toLowerCase();
      const args = parts.slice(1);

      let response: string;

      switch (command) {
        case "start":
        case "help":
          response = [
            "🤖 <b>WebistryDev Bot</b>",
            "",
            "Available commands:",
            "• <code>/status [project]</code> — Show PM2 process status",
            "• <code>/restart <project></code> — Restart a PM2 process",
            "• <code>/logs <project> [lines]</code> — Show recent logs",
            "• <code>/deploy <project></code> — Trigger deployment (stub)",
            "• <code>/build <project></code> — Trigger build (stub)",
            "• <code>/help</code> — Show this help",
            "",
            "Examples:",
            "  <code>/status</code>",
            "  <code>/restart ahmed-elakad-live</code>",
            "  <code>/logs webistrydev 100</code>",
          ].join("\n");
          break;
        default:
          response = await executeCommand(command, args);
      }

      await sendTelegramMessage(chatId, response);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WebistryDev Telegram webhook endpoint",
    bot: "Webistrydev_bot",
  });
}