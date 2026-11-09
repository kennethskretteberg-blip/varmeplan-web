// 224: kjører én regresjonstest i ny fane og skriver sammendrag + røde rader.
import { openPage } from './cdp.mjs';
const n = process.argv[2];
const p = await openPage(process.env.URL0 || 'http://localhost:4000/');
const r = await p.eval(`(async () => { try { await _loadProducts(); } catch (e) {}
  const t = await ${n}(); return { pass: t.filter(x => x.ok).length, total: t.length, fail: t.filter(x => !x.ok).map(x => ({ n: x.name, e: x.expected, g: x.got })) }; })()`);
console.log(n, r.pass + '/' + r.total, JSON.stringify(r.fail, null, 0).slice(0, 3000));
await p.close(); process.exit(0);
