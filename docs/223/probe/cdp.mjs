// 226: CDP-klient (kopi av docs/217-hindring/probe/cdp.mjs) — alltid ny fane, Chrome på 9333.
// Skjermbilder tas med deviceScaleFactor 2 (KJOR.md).
import fs from 'node:fs';
export async function openPage(url, port = 9333, dsf = 2) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: dsf, mobile: false });
  const p = {
    send, events, target,
    async goto(u) { await send('Page.navigate', { url: u }); for (let i = 0; i < 100; i++) { await new Promise(r => setTimeout(r, 200)); if (events.some(e => e.method === 'Page.loadEventFired')) break; } await new Promise(r => setTimeout(r, 800)); },
    async eval(expr, userGesture = false) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture }); if (r.result && r.result.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 1500)); return r.result && r.result.result ? r.result.result.value : undefined; },
    async shot(file, clip) { const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { scale: 1, ...clip } } : {}) }); fs.writeFileSync(file, Buffer.from(r.result.data, 'base64')); },
    async close() { ws.close(); try { await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`); } catch (e) {} },
  };
  if (url) await p.goto(url);
  return p;
}
export const sov = ms => new Promise(r => setTimeout(r, ms));
