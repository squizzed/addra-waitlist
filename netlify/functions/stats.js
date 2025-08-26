import { blobs } from '@netlify/blobs';
export const handler = async () => {
  try{
    const store = blobs();
    const raw = await store.get('stats:count', { type: 'text' });
    const count = raw === null ? 0 : (parseInt(raw,10) || 0);
    return json(200, { count });
  }catch{
    return json(200, { count: 0 });
  }
};
function json(status, obj){
  return { statusCode: status, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'Access-Control-Allow-Origin':'*' }, body: JSON.stringify(obj) };
}
