    const axios = require('axios');
    const querystring = require('querystring');
    const passport = require('passport');
    const dotenv = require('dotenv');
    
    dotenv.config()

    function getRoutes(app) {
        console.log("se estan ejecutando las rutas")
        app.get(
        "/auth/spotify",
        passport.authenticate("spotify", {
        scope: ["user-read-email", "user-read-private", "user-top-read", "user-read-currently-playing"],
        })
        );

        app.get(
        "/auth/spotify/callback",
        passport.authenticate("spotify", { failureRedirect: "/" }),
        (req, res) => {
            res.redirect("/main.html");
        }
        );

        app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
        });

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
            if (!req.isAuthenticated()) {
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

        app.get("/top-tracks", async (req, res) => {
        try {
            if (!req.isAuthenticated()) {
            return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const options = {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { type: "tracks", time_range: "long_term", limit: 10 },
            };
            const response = await axios.get(
            "https://api.spotify.com/v1/me/top/tracks",
            options
            );
            const { items } = response.data;
            if (Array.isArray(items) && items.length > 0) {
            const topTrackNames = items.map(({ name, artists }) => ({
                name,
                artists: artists.map((artist) => artist.name),
            }));
            res.json(topTrackNames);
            } else {
            console.log("No se encontraron canciones más escuchadas.");
            res.status(404).send("No se encontraron canciones más escuchadas.");
            }
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
            if (!req.isAuthenticated()) {
            return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const topArtistResponse = await axios.get(
            "https://api.spotify.com/v1/me/top/artists",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { type: "artists", time_range: "long_term", limit: 1 },
            }
            );
            const topArtist = topArtistResponse.data.items[0];
            if (topArtist) {
            res.json({
                name: topArtist.name,
                genres: topArtist.genres,
                popularity: topArtist.popularity,
                image: topArtist.images.length > 0 ? topArtist.images[0].url : null,
            });
            } else {
            res.status(404).send("No se encontró el artista más escuchado.");
            }
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
            if (!req.isAuthenticated()) {
                return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            const options = {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { type: "artists", time_range: "long_term", limit: 10 },
            };
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/artists",
                options
            );
            const { items } = response.data;
            if (Array.isArray(items) && items.length > 0) {
                const topArtists = items.map(({ name, genres, images }) => ({
                name,
                genres,
                images,
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
                if (!req.isAuthenticated()) {
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
                        res.json(response.data.item);
                    } else {
                        res.status(404).send("No se encontró ninguna canción en reproducción actualmente.");
                    }
                }
            } catch (error) {
                console.error("Error al obtener la canción actualmente en reproducción:", error);
                res.status(500).send("Error al obtener la canción actualmente en reproducción.");
            }
        });
        
        
        app.get("/playlist", async (req, res) => {
            try {
            if (!req.isAuthenticated()) {
                return res.status(401).send("No autorizado");
            }
            const accessToken = req.user.accessToken;
            console.log(accessToken);
            const options = {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                },

                params: {
                type: "tracks",
                time_range: "long_term",
                limit: 20,
                },
            };
            const response = await axios.get(
                "https://api.spotify.com/v1/me/top/tracks",
                options
            );
            const { items } = response.data;
            if (Array.isArray(items) && items.length > 0) {
                const topTrackNames = items.map(({ name, artists }) => ({
                name,
                artists: artists.map((artist) => artist.name),
                }));
                res.json(topTrackNames);
            } else {
                console.log("No se encontraron canciones más escuchadas.");
                res.status(404).send("No se encontraron canciones más escuchadas.");
            }
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
        
        }

    module.exports = {getRoutes};