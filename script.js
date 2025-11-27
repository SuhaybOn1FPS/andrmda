// lastfm.js
document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "09f6d36674db4c07e36a1fa2c44a38f0"; // your key
  const USERNAME = "suhaybon1fps";                    // your username
  const POLL_MS = 5000;                               // 5000 = 5s

  const elTrack = document.getElementById("lastfm-track");
  const elArtist = document.getElementById("lastfm-artist");
  const elArt = document.getElementById("lastfm-art");

  // tiny inline SVG placeholder (grey box) to avoid missing-file 404s
  const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
       <rect width="100%" height="100%" fill="#222"/>
       <text x="50%" y="50%" fill="#777" font-size="18" font-family="Arial" text-anchor="middle" dominant-baseline="middle">No Art</text>
     </svg>`
  );

  if (!elTrack || !elArtist || !elArt) {
    console.error("Last.fm elements not found. Make sure #lastfm-track, #lastfm-artist and #lastfm-art exist in your HTML.");
    return;
  }

  async function fetchNowPlaying() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(USERNAME)}&api_key=${encodeURIComponent(API_KEY)}&format=json&limit=1&_=${Date.now()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const tracks = json?.recenttracks?.track;
      if (!tracks || tracks.length === 0) {
        // Nothing found
        elTrack.textContent = "No recent track";
        elArtist.textContent = "";
        elArt.src = PLACEHOLDER;
        return;
      }

      const track = tracks[0];

      // name and artist (defensive)
      const name = track?.name || "Unknown track";
      const artist = (track?.artist && (track.artist["#text"] || track.artist.name)) || "Unknown artist";

      // Last.fm sends an array of images; pick the largest non-empty image.
      let artUrl = PLACEHOLDER;
      if (Array.isArray(track.image)) {
        // Prefer "extralarge" or the biggest available entry
        const imgs = track.image.filter(i => i && i["#text"]);
        if (imgs.length) {
          // images usually are ordered small -> large; pick last non-empty
          artUrl = imgs[imgs.length - 1]["#text"] || imgs[imgs.length - 1]["#text"] || PLACEHOLDER;
        }
      }

      // Update DOM
      elTrack.textContent = name;
      elArtist.textContent = artist;
      elArt.src = artUrl || PLACEHOLDER;
      elArt.alt = `${name} — ${artist}`;

      // Add now-playing marker if track is currently playing (optional visual cue)
      const nowPlaying = track?.["@attr"]?.nowplaying === "true";
      if (nowPlaying) {
        // e.g. append a dot or change opacity — here we add a small marker class
        elTrack.classList.add("now-playing");
      } else {
        elTrack.classList.remove("now-playing");
      }
    } catch (err) {
      console.error("Error fetching Last.fm:", err);
      elTrack.textContent = "Error loading track";
      elArtist.textContent = "";
      elArt.src = PLACEHOLDER;
    }
  }

  // initial load + poll
  fetchNowPlaying();
  setInterval(fetchNowPlaying, POLL_MS);
});
