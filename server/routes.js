const axios = require('axios');
const querystring = require('querystring');
const passport = require('passport');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config()

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
                'playlist-modify-public',
                'playlist-modify-private',
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
    const isAuthenticated = (req) => req.isAuthenticated ? req.isAuthenticated() : false;

    app.get("/callback", passport.authenticate("spotify", {
        failureRedirect: "/",
    }),
        async (req, res) => {
            try {
                const user = req.user;
                const response = await axios.post(
                    "https://accounts.spotify.com/api/token",
                    querystring.stringify({
                        grant_type: "authorization_code",
                        code: req.query.code,
                        redirect_uri: process.env.REDIRECT_URI,
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                    }),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );


                const { access_token, refresh_token, expires_in } = response.data;
                user.accessToken = access_token;
                user.refreshToken = refresh_token;
                user.expiresIn = expires_in;

                await user.save();

                res.redirect("../regal/index.html");
            } catch (error) {
                console.error(
                    "Error en la obtención del token de acceso:",
                    error.message
                );
                res.status(500).send("Error en la obtención del token de acceso");
            }
        }
    );

    app.get("/me", async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send("No autorizado");
            }

            const accessToken = req.user.accessToken;
            const userProfileResponse = await axios.get(
                "https://api.spotify.com/v1/me",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            const userProfile = userProfileResponse.data;
            res.json(userProfile);
        } catch (error) {
            console.error(
                "Error al obtener la información del perfil del usuario:",
                error.message
            );
            res
                .status(500)
                .send("Error al obtener la información del perfil del usuario.");
        }
    });


    app.get('/devices', async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send('No autorizado');
            }
            const accessToken = req.user.accessToken;

            const response = await axios.get('https://api.spotify.com/v1/me/player/devices', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            const devices = response.data.devices;
            res.json(devices);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch devices' });
        }
    });

    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir la sesión:', err);
                return res.status(500).send('Error al cerrar sesión.');
            };
            res.redirect('/index.html')
        });
    });

    app.get('/me/following', async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send('No autorizado');
            }

            const accessToken = req.user.accessToken;

            const response = await axios.get('https://api.spotify.com/v1/me/following', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    type: 'artist',
                },
            });
            const artists = response.data;

            res.json(artists);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch followed artists' });
        }
    });

    app.get("/top-tracks", async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const options = {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { type: "tracks", time_range: "short_term", limit: 10 },
            };
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/tracks",
                options
            );

            const { items } = response.data;
            res.json(items);
        } catch (error) {
            console.error(
                "Error al obtener las canciones más escuchadas:",
                error.message
            );
            res
                .status(500)
                .send(
                    `Error al obtener las canciones más escuchadas: ${error.message}`
                );
        }
    });

    app.get("/top-artist", async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const topArtistResponse = await axios.get(
                "https://api.spotify.com/v1/me/top/artists",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { type: "artists", time_range: "short_term", limit: 1 },
                }
            );
            res.json(topArtistResponse)
        } catch (error) {
            console.error(
                "Error al obtener el artista más escuchado:",
                error.message
            );
            res
                .status(500)
                .send(`Error al obtener el artista más escuchado: ${error.message}`);
        }
    });

    app.get("/top-artists", async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const options = {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { type: "artists", time_range: "short_term", limit: 10 },
            };
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/artists",
                options
            );
            const { items } = response.data;
            if (Array.isArray(items) && items.length > 0) {
                const topArtists = items.map(({ name, genres, images, href }) => ({
                    name,
                    genres,
                    images,
                    href,
                }));
                res.json(topArtists);
            } else {
                console.log("No se encontraron artistas más escuchados.");
                res.status(404).send("No se encontraron artistas más escuchados.");
            }
        } catch (error) {
            console.error(
                "Error al obtener los artistas más escuchados:",
                error.response?.data || error.message
            );
            res
                .status(error.response?.status || 500)
                .send("Error al obtener los artistas más escuchados");
        }
    });

    app.get("/song-now", async (req, res) => {
        try {
            if (!isAuthenticated(req)) {
                return res.status(401).send("No autorizado");
            } else {
                const accessToken = req.user.accessToken;
                const options = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                };
                const response = await axios.get(
                    "https://api.spotify.com/v1/me/player/currently-playing",
                    options
                );

                if (response.data && response.data.item) {
                    res.json(response.data);
                } else {
                    res.json('No song is playing')
                }
            }
        } catch (error) {
            console.error("Error al obtener la canción actualmente en reproducción:", error);
            res.status(500).send("Error al obtener la canción actualmente en reproducción.");
        }
    });


    app.get('/playlist', async (req, res) => {
        try {
            const accessToken = req.user.accessToken;
            const month = new Date().toLocaleString('en', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());
            if (!accessToken) {
                return res.status(401).json({ error: 'No access token provided' });
            }
                const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 50, time_range: 'short_term' },
            });
            const topTracks = topTracksResponse.data.items.map(track => track.uri);
            const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userId = userProfileResponse.data.id;
    
            const newPlaylistResponse = await axios.post(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                {
                    name: `Top 50 ${month}`,
                    description: 'Your top 50 songs of the month',
                    public: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const playlistId = newPlaylistResponse.data.id;
                await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: topTracks },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            res.status(200).json({
                message: 'Playlist creada con éxito',
                playlistUrl: newPlaylistResponse.data.external_urls.spotify,
            });
        } catch (error) {
            console.error('Error en /playlist:', error.response?.data || error.message);
            res.status(500).json({ error: 'Error al crear la playlist', details: error.response?.data || error.message });
        }
    });
    

    app.get('/top-genres', async (req, res) => {
        const accessToken = req.user.accessToken;
        try {
            const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,

                },
                params: {
                    limit: 10,
                },
            });

            const genres = response.data.items
                .flatMap(artist => artist.genres)
                .reduce((acc, genre) => {
                    acc[genre] = (acc[genre] || 0) + 1;
                    return acc;
                }, {});

            const sortedGenres = Object.entries(genres)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([genre]) => ({ name: genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase() }));

            res.json(sortedGenres);
        } catch (error) {
            console.error('Error fetching top genres:', error);
            res.status(500).json({ error: 'Failed to fetch top genres' });
        }
    });

    app.get('/recently-played', async (req, res) => {
        const accessToken = req.user.accessToken;

        try {
            const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    limit: 10,
                },
            });

            const songs = response.data.items
            res.json(songs);
        } catch (error) {
            console.error(
                'Error fetching recently played tracks:',
                error.response ? error.response.data : error.message
            );
            res.status(500).json({ error: 'Failed to fetch recently played tracks' });
        }
    });

    
}

module.exports = { getRoutes };