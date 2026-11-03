async function callAnthropic(messages, model, apiKey) {
  const systemMsg = messages.find(m => m.role === 'system')
  const chatMessages = messages.filter(m => m.role !== 'system')

  const body = {
    model,
    max_tokens: 4096,
    messages: chatMessages,
  }
  if (systemMsg) body.system = systemMsg.content

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Anthropic error ${res.status}`)
  return data.content[0].text
}

// Собирает полный адрес запроса из Base URL.
// Пустое значение → fallback. Можно вставить и просто «.../v1», и полный «.../chat/completions».
function resolveChatUrl(baseUrl, fallback) {
  const raw = (baseUrl || '').trim() || fallback
  const clean = raw.replace(/\/+$/, '')
  return /\/chat\/completions$/.test(clean) ? clean : `${clean}/chat/completions`
}

async function callOpenAI(messages, model, apiKey, baseUrl, fallbackBaseUrl = 'https://api.openai.com/v1') {
  const url = resolveChatUrl(baseUrl, fallbackBaseUrl)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  })
  const raw  = await res.text()
  let data   = null
  try { data = JSON.parse(raw) } catch { /* провайдер вернул не JSON — покажем текст ниже */ }
  if (!res.ok || !data) {
    const msg = data?.error?.message || data?.message || raw.slice(0, 300) || 'пустой ответ'
    throw new Error(`${res.ok ? 'Некорректный ответ' : 'Ошибка'} ${res.status} (${url}): ${msg}`)
  }
  return data.choices[0].message.content
}

async function callGemini(messages, model, apiKey) {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const systemMsg = messages.find(m => m.role === 'system')
  const body = { contents }
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Gemini error ${res.status}`)
  return data.candidates[0].content.parts[0].text
}

async function callOllama(messages, model, endpoint) {
  const url = `${endpoint.replace(/\/$/, '')}/api/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Ollama error ${res.status}`)
  return data.message.content
}

async function routeAiChat({ messages, provider, model, apiKey, ollamaEndpoint, openaiBaseUrl, systemPrompt }) {
  // Inject system prompt by prepending a system message (each provider handles it internally)
  const withSystem = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages.filter(m => m.role !== 'system')]
    : messages
  switch (provider) {
    case 'anthropic': return callAnthropic(withSystem, model, apiKey)
    case 'openai':    return callOpenAI(withSystem, model, apiKey, openaiBaseUrl)
    case 'routerai':  return callOpenAI(withSystem, model, apiKey, openaiBaseUrl, 'https://routerai.ru/api/v1')
    case 'gemini':    return callGemini(withSystem, model, apiKey)
    case 'ollama':    return callOllama(withSystem, model, ollamaEndpoint || 'http://localhost:11434')
    default:          throw new Error(`Unknown AI provider: ${provider}`)
  }
}

module.exports = { routeAiChat }
