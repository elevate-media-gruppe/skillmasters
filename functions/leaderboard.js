export async function onRequestGet(context) {
    const { env } = context;
    const kv = env.CHALLENGE_DATA;
    
    // Holt die Liste aus dem Speicher
    const data = await kv.get("main_list", { type: "json" }) || [];
    
    // Gibt die sortierte Liste an die Webseite zurück
    return new Response(JSON.stringify(data), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
    });
}

