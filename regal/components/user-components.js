let urlProfile = '';
let genres = '';

const date = new Date();
const dateText = document.getElementById("date");
dateText.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

//funciona
const userElement = document.getElementById('user-name');
fetch('/me')
    .then(response => response.json())
    .then(userProfile => {
        //userProfile.display_name
        userElement.textContent = userProfile.display_name;

        urlProfile=userProfile.external_urls.spotify;
        const userProfileImage = document.getElementById('user-img');
        userProfileImage.src = userProfile.images.length > 0 ? userProfile.images[0].url : '';

    })
    .catch(error => {
        userElement.textContent = 'User not found';
        
    })


//lista la wea
const tbody = document.querySelector('.table tbody');
fetch('/top-tracks')
    .then(response => response.json())
    .then(topTracks => {
        let index = 0;
        topTracks.forEach(track => {
            var newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td></td>
                <td>${track.name}</td>
                <td></td>
                <td>${track.artists[0]}${track.artists.length > 1 ? ', ' + track.artists[1] : ''}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                `; 
            tbody.appendChild(newRow);
            index++;
        });
    })
    .catch(error => tbody.innerHTML = `<tr><td colspan="11">We couldn't find your top tracks. The error is: ${error.message}</td></tr>`);

    //en proceso ashjgdjha
const topArtistsList = document.querySelector('.table-artists tbody');
fetch('/top-artists')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error (${response.status}): ${response.statusText}`);
        }
        return response.json();
    })
    .then(topArtists => {
        let index = 0;
        topArtists.forEach(artist => {
            const listItem = document.createElement('tr');
            genres = artist.genres.join(', ');
            listItem.innerHTML = `
                <td>${index+1}</td>
                <td>${artist.name}</td>
                <td></td>
                <td></td>
                `;
            topArtistsList.appendChild(listItem);
            index++;
        });
    })
    .catch(error => topArtistsList.innerHTML = `<tr><td colspan="4">We couldn't find your favorite artists. The error is: ${error.message}</td></tr>`);


    const topGenresList = document.querySelector('.table-genre tbody');

fetch('/top-genres')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error (${response.status}): ${response.statusText}`);
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
    .catch(error => topGenresList.innerHTML = `<tr><td colspan="2">We couldn't find your top genres. The error is: ${error.message}</td></tr>`);

    const recentlyPlayedElement = document.querySelector('#recently-played');
    fetch('/recently-played')
    .then(response => response.json())
    .then(recentlyPlayed => {
        if (!recentlyPlayed || recentlyPlayed.length === 0) {
            recentlyPlayedElement.innerHTML = '<p>No recently played tracks found.</p>';
            return;
        }
        index = 0;
        recentlyPlayedElement.innerHTML = ''; // Clear previous content
        recentlyPlayed.forEach(track => {
            const trackElement = document.createElement('tr');
            trackElement.innerHTML = `
                <td>${index + 1}</td>
                <td>${track.name}</td>
            `;
            recentlyPlayedElement.appendChild(trackElement);
            index++;
        });
    })
    .catch(error => {
        const recentlyPlayedElement = document.querySelector('#recently-played');
        recentlyPlayedElement.innerHTML = `<p>We couldn't find your recently played tracks. The error is: ${error.message}</p>`;
    });


    
    const songNowElement = document.getElementById('song-now');
try {
    fetch('/song-now').then(r => r.json()).then(data => {
        
        songNowElement.innerHTML = `<h6>You are listening <strong>${data.name}</strong></h3>
                                        
                                        <div>By <strong>${data.artists[0].name}</strong></div>
                                        `;
    });
} catch (e) {
    songNowElement.innerHTML = `<h6>You are not listening to any song</h6>`;
}




function playlist(){
    fetch('/playlist')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error (${response.status}): ${response.statusText}`);
        }
        return response.json();
    })
    .then(topTracks => {
        let songsID = []
        console.log(topTracks)
        topTracks.forEach((track) => {
            
            
        });
    })
    .catch(error => console.error('Error fetching top tracks:', error));
}



function mail(){
    return location.href = 'mailto:raivicuna@gmail.com?subject=Contact';
}
function openSpotify(url=urlProfile) {
    event
    window.open(`${url}`, '_blank');
}

document.querySelector('.SPOTIFY').addEventListener('click', function(event){
    event.preventDefault()
    openSpotify();
});