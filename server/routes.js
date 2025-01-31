const axios = require('axios');
const querystring = require('querystring');
const passport = require('passport');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

async function refreshSpotifyToken(user) {
    try {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            querystring.stringify({
                grant_type: "refresh_token",
                refresh_token: user.refreshToken,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, expires_in } = response.data;
        user.accessToken = access_token;
        user.expiresAt = Date.now() + expires_in * 1000; 
        await user.save();
        return access_token;
    } catch (error) {
        console.error("Error al renovar el token de acceso:", error.message);
        return null;
    }
}

async function checkAndRefreshToken(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send("No autorizado");
    }

    const user = req.user;

    if (!user.accessToken || !user.expiresAt || Date.now() >= user.expiresAt) {
        console.log("expiro la wea, se esta cambiando");
        const newAccessToken = await refreshSpotifyToken(user);
        if (!newAccessToken) {
            return res.status(500).send("Error al renovar el token de acceso");
        }
        req.user.accessToken = newAccessToken;
    }
    next();
}

function getRoutes(app) {
    app.use(cookieParser());

    app.get(
        "/auth/spotify",
        passport.authenticate("spotify", {
            scope: [
                "user-read-email",
                "user-read-private",
                "user-top-read",
                "user-read-currently-playing",
                "user-read-recently-played",
                "user-follow-read",
                "user-read-playback-state",
                "playlist-modify-public",
                "playlist-modify-private",
            ],
        })
    );

    app.get(
        "/auth/spotify/callback",
        passport.authenticate("spotify", { failureRedirect: "/" }),
        (req, res) => {
            res.redirect("/main.html");
        }
    );

    app.get("/me", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const userProfileResponse = await axios.get(
                "https://api.spotify.com/v1/me",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            res.json(userProfileResponse.data);
        } catch (error) {
            console.error("Error al obtener perfil:", error.message);
            res.status(500).send("Error al obtener la información del perfil.");
        }
    });

    app.get("/devices", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const response = await axios.get("https://api.spotify.com/v1/me/player/devices", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            res.json(response.data.devices);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch devices" });
        }
    });

    app.get("/top-tracks", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const response = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { time_range: "short_term", limit: 10 },
            });

            res.json(response.data.items);
        } catch (error) {
            res.status(500).send("Error al obtener las canciones más escuchadas.");
        }
    });

    app.get("/top-artists", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { time_range: "short_term", limit: 10 },
            });

            res.json(response.data.items);
        } catch (error) {
            res.status(500).send("Error al obtener los artistas más escuchados.");
        }
    });

    app.get("/song-now", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const response = await axios.get(
                "https://api.spotify.com/v1/me/player/currently-playing",
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            res.json(response.data.item ? response.data : { message: "No song is playing" });
        } catch (error) {
            res.status(500).send("Error al obtener la canción en reproducción.");
        }
    });

    app.get("/playlist", checkAndRefreshToken, async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const month = new Date().toLocaleString("en", { month: "long" });

            const topTracksResponse = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 50, time_range: "short_term" },
            });

            const userProfileResponse = await axios.get("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const userId = userProfileResponse.data.id;
            const topTracks = topTracksResponse.data.items.map((track) => track.uri);

            const newPlaylistResponse = await axios.post(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                { name: `Top 50 ${month}`, description: "Your top 50 songs of the month", public: false },
                { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
            );

            await axios.post(
                `https://api.spotify.com/v1/playlists/${newPlaylistResponse.data.id}/tracks`,
                { uris: topTracks },
                { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
            );

            res.json({ message: "Playlist creada con éxito", playlistUrl: newPlaylistResponse.data.external_urls.spotify });
        } catch (error) {
            res.status(500).json({ error: "Error al crear la playlist" });
        }
    });
}

module.exports = { getRoutes };