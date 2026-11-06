// Capture a PNG of the page behind a CDP websocket URL.
//   /d/nodejs/node.exe cdp-shot.js <wsUrl> <out.png>
const [, , wsUrl, out] = process.argv
const fs = require('fs')
const ws = new WebSocket(wsUrl)
let id = 0
const pending = new Map()
function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = ++id
    pending.set(msgId, resolve)
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
}
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result || m); pending.delete(m.id) }
})
ws.addEventListener('open', async () => {
  try {
    const r = await send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(out, Buffer.from(r.data, 'base64'))
    console.log('saved', out, fs.statSync(out).size)
  } catch (e) { console.log('ERR', e.message) }
  ws.close(); process.exit(0)
})
ws.addEventListener('error', (e) => { console.error('WS', e.message); process.exit(1) })
