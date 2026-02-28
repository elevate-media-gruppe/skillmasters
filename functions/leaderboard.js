export async function onRequestGet(context) {
    const { env } = context;
    const db = env.DB; // Dein D1 Datenbank-Binding

    try {
        // SQL: Wähle Name und Bestzeit, sortiere aufsteigend (ASC), limitiere auf Top 100
        const { results } = await db.prepare(`
            SELECT twitch_name as name, best_time as time 
            FROM leaderboard 
            ORDER BY best_time ASC 
            LIMIT 100
        `).all();

        return new Response(JSON.stringify(results), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
