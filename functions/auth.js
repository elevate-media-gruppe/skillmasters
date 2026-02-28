export async function onRequestGet(context) {
    const { env, request } = context;
    const clientID = env.TWITCH_CLIENT_ID;
    const clientSecret = env.TWITCH_CLIENT_SECRET;
    
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const redirectUri = `https://${url.host}/functions/auth`;

    // 1. Wenn kein Code vorhanden, User zu Twitch leiten
    if (!code) {
        const authUrl = `https://id.twitch.tv{clientID}&redirect_uri=${redirectUri}&response_type=code&scope=user:read:email`;
        return Response.redirect(authUrl, 302);
    }

    // 2. Code gegen Access Token tauschen
    const tokenResponse = await fetch('https://id.twitch.tv', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientID,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        })
    });

    const tokenData = await tokenResponse.json();
    
    // 3. User-Daten abfragen (Display Name)
    const userResponse = await fetch('https://api.twitch.tv', {
        headers: {
            'Client-ID': clientID,
            'Authorization': `Bearer ${tokenData.access_token}`
        }
    });

    const userData = await userResponse.json();
    const displayName = userData.data[0].display_name;

    // 4. Name in einem Cookie speichern (für 24h gültig)
    return new Response(null, {
        status: 302,
        headers: {
            'Location': '/timechallenge.html',
            'Set-Cookie': `twitch_user=${displayName}; Path=/; Max-Age=86400; SameSite=Lax`
        }
    });
}

