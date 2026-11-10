// 229 · Falsk Storage-tjener for tørrkjøringen (test/torrkjoring.sh). Etterligner den delen
// av Supabase Storage-API-et som ta-kopi.sh og last-opp-filer.sh bruker, med en mappe på
// disken som «bøtter». Krever riktig nøkkel i både apikey og Authorization.
//   node falsk-storage.mjs <rotmappe> <port> <nøkkel>
// En fil som heter noe med «.fantom» listes, men gir 404 ved nedlasting (tester «fil manglet»).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [rot, port, nokkel] = process.argv.slice(2);
const json = (res, kode, o) => {
  res.writeHead(kode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(o));
};

http.createServer((req, res) => {
  const deler = new URL(req.url, 'http://x').pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const biter = [];
  req.on('data', c => biter.push(c));
  req.on('end', () => {
    const kropp = Buffer.concat(biter);
    if (req.headers.authorization !== 'Bearer ' + nokkel || req.headers.apikey !== nokkel) {
      return json(res, 401, { error: 'Unauthorized' });
    }
    if (deler[0] !== 'storage' || deler[1] !== 'v1') return json(res, 404, { error: 'not found' });
    // GET /storage/v1/bucket
    if (req.method === 'GET' && deler[2] === 'bucket' && deler.length === 3) {
      const b = fs.readdirSync(rot).filter(n => fs.statSync(path.join(rot, n)).isDirectory()).sort();
      return json(res, 200, b.map(n => ({ id: n, name: n, public: n === 'branding' })));
    }
    // POST /storage/v1/bucket
    if (req.method === 'POST' && deler[2] === 'bucket' && deler.length === 3) {
      const o = JSON.parse(kropp.toString());
      fs.mkdirSync(path.join(rot, o.id), { recursive: true });
      fs.appendFileSync(path.join(rot, '.botter-laget.txt'), o.id + ' public=' + o.public + '\n');
      return json(res, 200, { name: o.id });
    }
    // POST /storage/v1/object/list/<bøtte>
    if (req.method === 'POST' && deler[2] === 'object' && deler[3] === 'list' && deler.length === 5) {
      const o = JSON.parse(kropp.toString());
      const mappe = path.join(rot, deler[4], o.prefix || '');
      if (!fs.existsSync(mappe)) return json(res, 200, []);
      const alle = fs.readdirSync(mappe).sort().map(n => {
        const st = fs.statSync(path.join(mappe, n));
        return st.isDirectory()
          ? { name: n, id: null, metadata: null }
          : { name: n, id: 'id-' + n, metadata: { size: st.size } };
      });
      return json(res, 200, alle.slice(o.offset || 0, (o.offset || 0) + (o.limit || 100)));
    }
    if (deler[2] === 'object' && deler.length >= 5) {
      const fil = path.join(rot, ...deler.slice(3));
      if (!fil.startsWith(rot)) return json(res, 400, { error: 'bad path' });
      // GET /storage/v1/object/<bøtte>/<sti>
      if (req.method === 'GET') {
        if (!fs.existsSync(fil) || fil.includes('.fantom')) return json(res, 404, { error: 'not found' });
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        return res.end(fs.readFileSync(fil));
      }
      // POST /storage/v1/object/<bøtte>/<sti>  (opplasting)
      if (req.method === 'POST') {
        fs.mkdirSync(path.dirname(fil), { recursive: true });
        fs.writeFileSync(fil, kropp);
        return json(res, 200, { Key: deler.slice(3).join('/') });
      }
    }
    return json(res, 404, { error: 'not found' });
  });
}).listen(Number(port), '127.0.0.1', () => console.log('falsk storage lytter på', port));
