// Cloudflare Pages Function: POST /api/lead
// Secrets (Pages → Settings → Variables and Secrets): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const MSG = {
  uk: {
    bad: "Некоректний запит.",
    name: "Вкажіть, будь ласка, ім’я.",
    contact: "Вкажіть Telegram або телефон.",
    task: "Коротко опишіть задачу.",
    down: "Форма тимчасово недоступна. Напишіть у Telegram @yura_kotovich.",
    fail: "Не вдалося надіслати. Напишіть у Telegram @yura_kotovich.",
  },
  en: {
    bad: "Invalid request.",
    name: "Please enter your name.",
    contact: "Please enter your Telegram or phone.",
    task: "Please briefly describe the task.",
    down: "The form is temporarily unavailable. Message me on Telegram @yura_kotovich.",
    fail: "Couldn’t send. Message me on Telegram @yura_kotovich.",
  },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: MSG.uk.bad }, 400);
  }

  const m = MSG[data.lang === "en" ? "en" : "uk"];

  // Honeypot: боти заповнюють приховане поле
  if (data.website) return json({ ok: true });

  const name = String(data.name || "").trim();
  const contact = String(data.contact || "").trim();
  const task = String(data.task || "").trim();

  if (name.length < 2 || name.length > 100) return json({ error: m.name }, 400);
  if (contact.length < 3 || contact.length > 100) return json({ error: m.contact }, 400);
  if (task.length < 5 || task.length > 2000) return json({ error: m.task }, 400);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ error: m.down }, 500);

  const text =
    `🎯 <b>Нова заявка з kotovich.uk</b>${data.lang === "en" ? " (EN)" : ""}\n\n` +
    `👤 <b>Ім’я:</b> ${esc(name)}\n` +
    `💬 <b>Контакт:</b> ${esc(contact)}\n` +
    `📝 <b>Задача:</b>\n${esc(task)}`;

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

  if (!res.ok) return json({ error: m.fail }, 502);
  return json({ ok: true });
}

export async function onRequest() {
  return json({ error: "Method Not Allowed" }, 405);
}
