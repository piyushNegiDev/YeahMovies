const config = {
  baseUrl: "https://api.themoviedb.org/3",
  imageBase: "https://image.tmdb.org/t/p/w500",
  backdropBase: "https://image.tmdb.org/t/p/w1280",
};
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOWE3YTk1NzhlN2Q1YTFkMWVlOWRhM2I5MDkwY2Y1NiIsIm5iZiI6MTc3MDYzOTM5MS4yMjg5OTk5LCJzdWIiOiI2OTg5ZDAxZjVjNDlkZjg0NTRjMWQwZDQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.vH_cBQCADB2CFbwhWVWQQctzyDzlrLq-DTTD6bLgUO4",
  },
};

const poster = document.getElementById("poster");
const backdrop = document.getElementById("backdrop");
const titleEl = document.getElementById("title");
const tagline = document.getElementById("tagline");
const overview = document.getElementById("overview");
const releaseDate = document.getElementById("releaseDate");
const runtime = document.getElementById("runtime");
const rating = document.getElementById("rating");
const eyebrow = document.getElementById("eyebrow");
const facts = document.getElementById("facts");
const castGrid = document.getElementById("cast");
const trailer = document.getElementById("trailer");
const similarGrid = document.getElementById("similar");
const watchlistToggle = document.getElementById("watchlistToggle");
const watchlistKey = "yeahmovies:watchlist";

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value) {
  if (!value) return "Not available";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function setFacts(list) {
  facts.innerHTML = "";
  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "meta-card";
    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = item.label;
    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = item.value;
    card.append(label, value);
    facts.append(card);
  });
}

function setCast(list) {
  castGrid.innerHTML = "";
  list.forEach((person) => {
    const card = document.createElement("div");
    card.className = "cast-card";
    const img = document.createElement("img");
    img.alt = person.name;
    img.src = person.profile_path
      ? `${config.imageBase}${person.profile_path}`
      : "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80";
    const name = document.createElement("div");
    name.className = "cast-name";
    name.textContent = person.name;
    const role = document.createElement("div");
    role.className = "cast-role";
    role.textContent = person.character || "Cast";
    card.append(img, name, role);
    castGrid.append(card);
  });
}

function setSimilar(list) {
  similarGrid.innerHTML = "";
  if (!list.length) {
    similarGrid.innerHTML = `<div class="empty-state">No similar movies found.</div>`;
    return;
  }
  list.forEach((movie, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${index * 40}ms`;
    const link = document.createElement("a");
    link.className = "card-link";
    link.href = movie.id ? `movie-details.html?id=${movie.id}` : "#";
    link.setAttribute("aria-label", `${movie.title || "Movie"} details`);
    const img = document.createElement("img");
    img.alt = movie.title || "Movie poster";
    img.src = movie.poster_path
      ? `${config.imageBase}${movie.poster_path}`
      : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";
    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = movie.title || "Untitled";
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const date = document.createElement("span");
    date.textContent = formatDate(movie.release_date);
    const ratingEl = document.createElement("span");
    ratingEl.className = "rating";
    ratingEl.textContent = movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "N/A";
    meta.append(date, ratingEl);
    body.append(title, meta);
    link.append(img, body);
    card.append(link);
    similarGrid.append(card);
  });
}

function setTrailer(videos = []) {
  trailer.innerHTML = "";
  const clip = videos.find(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Trailer" || video.type === "Teaser")
  );
  if (!clip) {
    trailer.innerHTML = `<div class="empty-state">Trailer not available.</div>`;
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${clip.key}`;
  iframe.title = clip.name || "Trailer";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  trailer.append(iframe);
}

function setWatchlistButton(id) {
  if (!watchlistToggle) return;
  watchlistToggle.textContent = isInWatchlist(id)
    ? "In watchlist"
    : "Add to watchlist";
}

function getWatchlist() {
  const stored = localStorage.getItem(watchlistKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function setWatchlist(list) {
  localStorage.setItem(watchlistKey, JSON.stringify(list));
}

function isInWatchlist(id) {
  if (!id) return false;
  return getWatchlist().includes(id);
}

function toggleWatchlist(id) {
  if (!id) return;
  const list = getWatchlist();
  if (list.includes(id)) {
    setWatchlist(list.filter((item) => item !== id));
  } else {
    setWatchlist([...list, id]);
  }
}

async function fetchMovie(id) {
  const url = new URL(`${config.baseUrl}/movie/${id}`);
  url.searchParams.set("append_to_response", "credits,similar,videos");
  const response = await fetch(url, options);
  return response.json();
}

function getMovieId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function init() {
  const id = getMovieId();
  if (!id) {
    titleEl.textContent = "Movie not found";
    overview.textContent = "We couldn't find a movie id in the URL.";
    return;
  }

  let movie = null;
  try {
    movie = await fetchMovie(id);
  } catch (error) {
    console.error(error);
  }
  if (!movie || movie.success === false) {
    titleEl.textContent = "Movie not found";
    overview.textContent = "We couldn't load this movie. Please try again.";
    return;
  }
  titleEl.textContent = movie.title || "Untitled";
  tagline.textContent = movie.tagline || "";
  overview.textContent =
    movie.overview || "No overview available for this movie.";
  releaseDate.textContent = formatDate(movie.release_date);
  runtime.textContent = movie.runtime ? `${movie.runtime} min` : "Not available";
  rating.textContent = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";
  eyebrow.textContent = movie.status || "Movie details";
  setWatchlistButton(Number(id));

  poster.src = movie.poster_path
    ? `${config.imageBase}${movie.poster_path}`
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

  if (movie.backdrop_path) {
    backdrop.style.backgroundImage = `linear-gradient(120deg, rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.2)), url(${config.backdropBase}${movie.backdrop_path})`;
  } else {
    backdrop.style.backgroundImage =
      "linear-gradient(120deg, rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.2))";
  }

  setFacts([
    {
      label: "Genres",
      value:
        movie.genres && movie.genres.length
          ? movie.genres.map((genre) => genre.name).join(", ")
          : "Not available",
    },
    { label: "Language", value: movie.original_language || "N/A" },
    { label: "Budget", value: formatMoney(movie.budget) },
    { label: "Revenue", value: formatMoney(movie.revenue) },
    { label: "Status", value: movie.status || "N/A" },
  ]);

  const cast = movie.credits?.cast ? movie.credits.cast.slice(0, 8) : [];
  setCast(cast);
  const videos = movie.videos?.results || [];
  setTrailer(videos);
  const similar = movie.similar?.results ? movie.similar.results.slice(0, 8) : [];
  setSimilar(similar);
}

init();

watchlistToggle?.addEventListener("click", () => {
  const id = Number(getMovieId());
  toggleWatchlist(id);
  setWatchlistButton(id);
});
