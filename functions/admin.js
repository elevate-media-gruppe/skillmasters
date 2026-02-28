export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    // Sicherheit: Prüft, ob dein Secret in der URL stimmt
    if (key !== env.ADMIN_SECRET) {
        return new Response("Nicht autorisiert.", { status: 401 });
    }

    const kv = env.CHALLENGE_DATA;
    
    // Löscht die aktuelle Liste komplett
    await kv.delete("main_list");

    return new Response("Leaderboard erfolgreich zurückgesetzt! Neue Runde kann starten.", { status: 200 });
}

