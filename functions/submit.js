export async function onRequestPost(context) {
    const { env, request } = context;
    const db = env.DB; // Dein D1 Binding
    
    // 1. Namen aus dem Cookie extrahieren
    const cookieHeader = request.headers.get("Cookie") || "";
    const nameMatch = cookieHeader.match(/twitch_user=([^;]+)/);
    
    if (!nameMatch) {
        return new Response("Nicht eingeloggt", { status: 401 });
    }
    
    const twitchName = decodeURIComponent(nameMatch[1]);
    const { time } = await request.json();
    const reactionTime = parseFloat(time);

    try {
        // 2. SQL: Einfügen oder Update, falls Zeit besser ist
        // Wir nutzen "best_time = MIN(...)", damit nur schnellere Klicks zählen
        await db.prepare(`
            INSERT INTO leaderboard (twitch_name, best_time) 
            VALUES (?, ?) 
            ON CONFLICT(twitch_name) DO UPDATE SET 
            best_time = MIN(leaderboard.best_time, EXCLUDED.best_time)
        `).bind(twitchName, reactionTime).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response("Datenbankfehler: " + e.message, { status: 500 });
    }
}
