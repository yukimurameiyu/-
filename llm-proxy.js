// netlify/functions/llm-proxy.js
export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { engine = 'proxy-openai', model = 'gpt-4o-mini', context: ctx } = JSON.parse(event.body || '{}');

    // Map engineId -> provider config via environment variables
    // You can set these in Netlify Site settings → Environment variables
    const providers = {
      'proxy-openai': { base: process.env.OPENAI_BASE || 'https://api.openai.com/v1', key: process.env.OPENAI_API_KEY },
      'proxy-qwen':   { base: process.env.QWEN_BASE   || 'https://dashscope.aliyuncs.com/compatible-mode/v1', key: process.env.QWEN_API_KEY },
      'proxy-deepseek': { base: process.env.DEEPSEEK_BASE || 'https://api.deepseek.com/v1', key: process.env.DEEPSEEK_API_KEY },
      'proxy-together': { base: process.env.TOGETHER_BASE || 'https://api.together.xyz/v1', key: process.env.TOGETHER_API_KEY },
      'proxy-groq': { base: process.env.GROQ_BASE || 'https://api.groq.com/openai/v1', key: process.env.GROQ_API_KEY }
    };
    const cfg = providers[engine];
    if (!cfg || !cfg.key) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing provider config or API key' }) };
    }

    const messages = [
      { role: 'system', content: ctx.system || '' },
      ...(ctx.messages || []).map(m => ({ role: m.role, content: m.content }))
    ];

    const resp = await fetch(`${cfg.base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.key}` },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, body: JSON.stringify({ error: 'upstream error', detail: text }) };
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
}
