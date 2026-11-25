// Udawany serwer push: opóźnienie sieciowe 20–100 ms; ~1% subskrypcji wygasłych (410), ~2% 429, ~1% 503.
export default {
  async fetch(req: Request): Promise<Response> {
    await req.arrayBuffer();
    const id = Number(new URL(req.url).pathname.split('/').pop());
    await scheduler.wait(20 + Math.random() * 80);
    if (id % 97 === 0) return new Response(null, { status: 410 });
    const r = Math.random();
    if (r < 0.02) return new Response(null, { status: 429, headers: { 'retry-after': '10' } });
    if (r < 0.03) return new Response(null, { status: 503 });
    return new Response(null, { status: 201 });
  },
};
