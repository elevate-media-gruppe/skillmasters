export async function onRequestPost(context) {
    const { env, request } = context;
    
    // 1. Twitch-Namen aus dem Cookie holen
    const cookieHeader = request.headers.get("Cookie") || "";
    const nameMatch = cookieHeader.match(/twitch_user=([^;]+)/);
    
    if (!nameMatch) {
        return new Response("Nicht eingeloggt", { status: 401 });
    }
    
    const twitchName = decodeURIComponent(nameMatch[1]);
    const { time } = await request.json();

    // 2. In Cloudflare KV speichern
    // Wir speichern unter dem Key "leaderboard" ein JSON-Array
    const kv = env.CHALLENGE_DATA; 
    let leaderboard = await kv.get("main_list", { type: "json" }) || [];

    // Nur speichern, wenn der User noch nicht drin steht (Einmal-Teilnahme)
    const exists = leaderboard.find(entry => entry.name === twitchName);
    if (!exists) {
        leaderboard.push({ name: twitchName, time: parseFloat(time) });
        // Sortieren nach Bestzeit (aufsteigend)
        leaderboard.sort((a, b) => a.time - b.time);
        // Zurück in KV schreiben
        await kv.put("main_list", JSON.stringify(leaderboard));
    }

    return new Response(JSON.stringify({ success: true, leaderboard }), {
        headers: { "Content-Type": "application/json" }
    });
}

