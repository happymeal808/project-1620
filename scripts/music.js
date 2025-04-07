// === SPOTIFY TOKEN + PLAYLIST ===
document.addEventListener('DOMContentLoaded', () => {

    async function getSpotifyToken() {
        const res = await fetch('https://spotify-fonts-api-server-production.up.railway.app/api/spotify-token');
        const { access_token } = await res.json();
        return access_token;
      }
    
      async function getPlaylist(playlistId) {
        const token = await getSpotifyToken();  // Fetch access token from your API
      
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,  // Pass the token to authenticate the request
          }
        });
      
        const data = await res.json();
        return data;
      }
    
    // === PLAYER STATE ===
    
    let currentTrackIndex = 0;
    let currentPlaylist = [];
    
    const audio = document.getElementById('audio');
    const title = document.getElementById('track-title');
    const artist = document.getElementById('track-artist');
    
    // === BUTTON EVENTS ===
    
    document.getElementById('play').addEventListener('click', () => {
        if (audio.paused) {
        audio.play();
        document.getElementById('play').textContent = '⏸';
        } else {
        audio.pause();
        document.getElementById('play').textContent = '▶️';
        }
    });
    
    document.getElementById('next').addEventListener('click', () => playTrack(currentTrackIndex + 1));
    document.getElementById('prev').addEventListener('click', () => playTrack(currentTrackIndex - 1));
    
    document.getElementById('volume').addEventListener('input', e => {
        audio.volume = e.target.value;
    });
    
    audio.addEventListener('ended', () => {
        playTrack(currentTrackIndex + 1);
    });
    
    // === PLAY TRACK ===
    
    function playTrack(index) {
        if (!currentPlaylist.length) return;
    
        currentTrackIndex = (index + currentPlaylist.length) % currentPlaylist.length;
        const track = currentPlaylist[currentTrackIndex].track;
    
        title.textContent = track.name;
        artist.textContent = track.artists.map(a => a.name).join(', ');
    
        if (!track.preview_url) {
        audio.pause();
        audio.src = '';
        document.getElementById('play').textContent = '▶';
        artist.textContent += ' — No preview available';
        return;
        }
    
        audio.src = track.preview_url;
        audio.play();
        document.getElementById('play').textContent = '⏸';
    }
    
    // === INIT ===
    
    async function initSpotifyPlayer() {
        const playlist = await getPlaylist('4BB1UArnY2NjZ3Ehv4tSmh'); // Your playlist
console.log(playlist);
        
        console.log('Playlist fetched:', playlist);
        console.log('Tracks returned:', playlist.tracks.items.length);
      
        currentPlaylist = playlist.tracks.items.filter(item => {
          console.log('Track:', item.track.name, '| Preview:', item.track.preview_url);
          return item.track.preview_url;
        });
      
        console.log('Filtered playlist with previews:', currentPlaylist);
      
        if (!currentPlaylist.length) {
          title.textContent = '⚠️ No playable tracks in this playlist';
          artist.textContent = 'Try another playlist with previews!';
          return;
        }
      
        playTrack(0);
      }
    
    document.addEventListener('DOMContentLoaded', initSpotifyPlayer);
});