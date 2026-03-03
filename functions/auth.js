export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const redirectUri = `https://${url.host}/functions/auth`;

    try {
        if (!code) {
            const twitchUrl = `https://id.twitch.tv{env.TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user:read:email`;
            return Response.redirect(twitchUrl, 302);
        }

        const tokenResp = await fetch('https://id.twitch.tv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: env.TWITCH_CLIENT_ID,
                client_secret: env.TWITCH_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResp.json();
        if (!tokenData.access_token) return new Response("Twitch Token Error: " + JSON.stringify(tokenData), { status: 401 });

        const userResp = await fetch('https://api.twitch.tv', {
            headers: {
                'Client-ID': env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResp.json();
        // KRITISCHER FIX: Twitch sendet Daten in einem Array [0]
        const displayName = userData.data[0].display_name;

        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/timechallenge.html',
                'Set-Cookie': `twitch_user=${encodeURIComponent(displayName)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`
            }
        });
    } catch (e) {
        return new Response("Kritischer Fehler: " + e.message, { status: 500 });
    }
}
