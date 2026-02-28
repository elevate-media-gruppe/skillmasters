// /functions/admin.js
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    if (url.searchParams.get("key") !== env.ADMIN_SECRET) return new Response("Nein", { status: 401 });

    await env.DB.prepare("DELETE FROM leaderboard").run();
    return new Response("Tabelle geleert.");
}
