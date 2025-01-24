let urlProfile = '';
let genres = '';
let ISO_country = '';
let country = '';
let device = '';
let urlPlaylist = '';

const date = new Date();
const dateText = document.getElementById("date");
const userElement = document.getElementById('user-name');
const followingElement = document.querySelector('.about-you');
const tbody = document.querySelector('.table tbody');
const topArtistsList = document.querySelector('.table-artists tbody');
const topGenresList = document.querySelector('.table-genre tbody');
const recentlyPlayedElement = document.querySelector('.recently-played');
const songNowElement = document.getElementById('song-now');


dateText.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

fetch('/me')
    .then(response => response.json())
    .then(userProfile => {
        userElement.textContent = userProfile.display_name;
        ISO_country = userProfile.country;
        urlProfile = userProfile.external_urls.spotify;
        const userProfileImage = document.getElementById('user-img');
        userProfileImage.src = userProfile.images.length > 0 ? userProfile.images[0].url : '';
    })
    .catch(error => {
        userElement.textContent = 'User not found';
    });

fetch('/me/following')
    .then(response => {
        if (!response.ok) {
            return
        }
        return response.json();
    })
    .then(following => {
        transform_iso_to_name(ISO_country).then(countryName => {
            country = countryName;
            console.log(country)
        });
        if (following && following.artists && following.artists.total) {
            followingElement.innerHTML = `<p>You follow <strong>${following.artists.total}</strong> people and listen to them from <str>${country}</str> on Spotify</p>`;
        } else {
            followingElement.innerHTML = `<p>We don/'t have data about you!</p>`;
        }
    })
    .catch(error => {
        followingElement.innerHTML = `<p style="color:red;">We don't have data about you!</p>`;
        return
    });


fetch('/top-tracks')
    .then(response => {
        if (!response.ok) {
            return
        }
        return response.json();
    })
    .then(topTracks => {
        let index = 0;
        topTracks.forEach(track => {
            const newRow = document.createElement('tr');
            newRow.classList.add('trackRow');
            newRow.setAttribute('data-url', track.external_urls.spotify);
            const imageUrl = track.album.images?.[2]?.url || '';

            newRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td></td>
                    <td>
                        <img src='${imageUrl}' alt="${track.name}" 
                            style="object-fit: cover; border-radius: 5px;">
                    </td>
                    <td></td>
                    <td>${track.name}</td>
                    <td></td>
                    <td>${track.artists.map(artist => artist.name).join(', ')}</td>
                `;

            newRow.addEventListener('click', function () {
                openSpotify(track.external_urls.spotify);
            });

            tbody.appendChild(newRow);
            index++;
        });
    })
    .catch(error => {
        tbody.innerHTML = `<tr><td style="color:red;" colspan="11">We couldn't find your top tracks! Try again.</td></tr>`;
    });


fetch('/top-artists')
    .then(response => {
        if (!response.ok) {
            return
        }
        return response.json();
    })
    .then(topArtists => {
        let index = 0;
        topArtists.forEach(artist => {
            const imageUrl = artist.images?.[2]?.url || '';
            const listItem = document.createElement('tr');
            genres = artist.genres.join(', ');
            listItem.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src='${imageUrl}' alt="${artist.name}" 
                        style="object-fit: cover; border-radius: 5px;">
                    </td>               
                <td>${artist.name}</td>
                <td></td>
                <td></td>
                `;
            listItem.addEventListener('click', () => {
                openSpotify(artist.href)
            })
            topArtistsList.appendChild(listItem);
            index++;
        });
    })
    .catch(error => topArtistsList.innerHTML = `<tr><td colspan="4" style='color: red;'>We couldn't find your favorite artists! Try again.</td></tr>`);

fetch('/top-genres')
    .then(response => {
        if (!response.ok) {
            return
        }
        return response.json();
    })
    .then(topGenres => {
        let index = 0;
        topGenres.forEach(genre => {
            const listItem = document.createElement('tr');
            listItem.innerHTML = `
                <td>${index + 1}</td>
                <td>${genre.name}</td>
            `;
            topGenresList.appendChild(listItem);
            index++;
        });
    })
    .catch(error => topGenresList.innerHTML = `<tr><td style='color:red;;' colspan="2">We couldn't find your top genres! Try again.</td></tr>`);

fetch('/recently-played')
    .then(response => response.json())
    .then(recentlyPlayed => {
        if (!recentlyPlayed || recentlyPlayed.length === 0) {
            return;
        }
        let index = 0;
        recentlyPlayed.forEach(track => {
            let firstArtist = track.track.artists[0].name;
            const trackElement = document.createElement('tr');
            trackElement.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <img src='${track.track.album.images[0].url}' alt="${track.name}" 
                            style="object-fit: cover; border-radius: 5px;">
                    </td>
                    <td>${track.track.name} <strong>(${firstArtist})</strong></td>
                `;
            recentlyPlayedElement.appendChild(trackElement);
            index++;
        });
    })
    .catch(error => {
        recentlyPlayedElement.innerHTML = `<p style='color: red;'>We couldn't find your recently played tracks! Try Again.</p>`;
    });

fetch('/devices')
    .then(response => response.json())
    .then(data => {
        if (!data) {
            return;
        };
        data.forEach(Device => {
            if (Device.is_active) {
                device = Device.name;
            }
        });
    });

function fetchSongNow() {
    fetch('/song-now')
        .then(response => response.json())
        .then(data => {
            songNowElement.style.cursor = 'pointer';
            songNowElement.innerHTML = '';
            songNowElement.innerHTML = `
                    <a style="text-decoration: none; color: #666666;" 
                    href="${data.item.external_urls.spotify}" 
                    target="_blank" 
                    rel="noopener noreferrer">
                    <h6>
                        You are listening to <strong>${data.item.name}</strong> 
                        <img src="${data.item.album.images[2].url}" 
                                alt="${data.item.name}" 
                                style="object-fit: cover; border-radius: 5px; height: 1.5em; width: auto;">
                    </h6>
                    <div>
                        By <strong>${data.item.artists[0].name}</strong> on <strong>${device}</strong>
                    </div>
                    </a>

                    `;
        })
        .catch(() => {
            songNowElement.innerHTML = `<h6>You are not listening to any song</h6>`;
        });
}

fetchSongNow();

let intervalId = setInterval(fetchSongNow, 60000);

window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
});

function playlist() {
    const element = document.querySelector('.playlist-text');
    const button = document.querySelector('.submit-button');
    const goButton = document.querySelector('.GO');
    fetch('/playlist')
        .then(response => response.json())
        .then(data => {
            urlPlaylist = data.playlistUrl;
            if (!data) {
                element.style.color = 'red';
                element.textContent = 'The playlist could not be created';
                button.textContent = 'Close';
                document.querySelector('.EXIT').addEventListener('click', function (event) {
                    event.preventDefault();
                    hidePopup();
                });
                return
            } else {
                element.style.color = 'green';
                element.textContent = 'The playlist was created successfully';
                button.style.display = 'none';
                goButton.style.display = 'block';

            }
        })
};
async function transform_iso_to_name(iso) {
    if (!iso) {
        return '<span style="color: red;">(We don\'t know your country!)</span>';
    }
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${iso}`);
        if (!response.ok) {
            throw new Error(`Error fetching country data: ${response.statusText}`);
        }
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            return data[0].name.common;
        } else {
            throw new Error('Country not found');
        }
    } catch (error) {
        return '<span style="color: red;">(We don\'t know your country!)</span>';
    }
}

function mail() {
    return location.href = 'mailto:raivicuna@gmail.com?subject=Contact';
}
function openSpotify(url = urlProfile) {
    window.open(`${url}`, '_blank');
}

document.querySelector('.SPOTIFY').addEventListener('click', function (event) {
    event.preventDefault();
    openSpotify();
});

document.querySelector('.PLAYLIST').addEventListener('click', function (event) {
    event.preventDefault();
    playlist();
});

document.querySelector('.GO').addEventListener('click', function (event) {
    event.preventDefault();
    openSpotify(urlPlaylist);
});
