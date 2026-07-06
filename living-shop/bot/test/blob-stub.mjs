// In-memory @vercel/blob stub. downloadUrl = blob://<pathname>, resolved by the
// test's global fetch stub.
export const _store = new Map();
export async function put(pathname, data) {
  _store.set(pathname, typeof data === 'string' ? data : JSON.stringify(data));
  return { pathname, url: 'blob://' + pathname };
}
export async function head(pathname) {
  if (!_store.has(pathname)) throw new Error('not found: ' + pathname);
  return { pathname, downloadUrl: 'blob://' + pathname, url: 'blob://' + pathname };
}
export async function del(pathname) { _store.delete(pathname); }
