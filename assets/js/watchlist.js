const config = {
  baseUrl: "https://api.themoviedb.org/3",
  imageBase: "https://image.tmdb.org/t/p/w500",
};

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOWE3YTk1NzhlN2Q1YTFkMWVlOWRhM2I5MDkwY2Y1NiIsIm5iZiI6MTc3MDYzOTM5MS4yMjg5OTk5LCJzdWIiOiI2OTg5ZDAxZjVjNDlkZjg0NTRjMWQwZDQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.vH_cBQCADB2CFbwhWVWQQctzyDzlrLq-DTTD6bLgUO4",
  },
};

const watchlistKey = "yeahmovies:watchlist";
const fallbackPoster =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

const watchlistGrid = document.getElementById("watchlistGrid");
const watchlistCount = document.getElementById("watchlistCount");
const watchlistUpdated = document.getElementById("watchlistUpdated");

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

function setWatchlistCount(value) {
  if (!watchlistCount) return;
  const count = Number.isFinite(value) ? value : 0;
  watchlistCount.textContent = count.toLocaleString("en-US");
}

function setUpdatedLabel() {
  if (!watchlistUpdated) return;
  watchlistUpdated.textContent = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clearGrid() {
  if (!watchlistGrid) return;
  watchlistGrid.innerHTML = "";
}

function showEmpty(message) {
  if (!watchlistGrid) return;
  watchlistGrid.innerHTML = `<div class="empty-state">${message}</div>`;
}

function buildUrl(path, params = {}) {
  const url = new URL(`${config.baseUrl}${path}`);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function fetchJson(url) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function createCard(movie) {
  const card = document.createElement("article");
  card.className = "card";

  const link = document.createElement("a");
  link.className = "card-link";
  link.href = movie.id ? `movie-details.html?id=${movie.id}` : "#";
  link.setAttribute("aria-label", `${movie.title || "Movie"} details`);

  const img = document.createElement("img");
  img.alt = movie.title || "Movie poster";
  img.src = movie.poster_path
    ? `${config.imageBase}${movie.poster_path}`
    : fallbackPoster;

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = movie.title || "Untitled";

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const date = document.createElement("span");
  date.textContent = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const rating = document.createElement("span");
  rating.className = "rating";
  rating.textContent = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";

  meta.append(date, rating);
  body.append(title, meta);
  link.append(img, body);

  const watchlistBtn = document.createElement("button");
  watchlistBtn.className = "watchlist-btn";
  watchlistBtn.type = "button";
  watchlistBtn.textContent = "Remove";
  watchlistBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const list = getWatchlist().filter((item) => item !== movie.id);
    setWatchlist(list);
    card.remove();
    setWatchlistCount(list.length);
    if (!list.length) {
      showEmpty("Your watchlist is empty. Add movies from Discover.");
    }
  });

  card.append(link, watchlistBtn);
  return card;
}

async function loadWatchlist() {
  const ids = getWatchlist();
  setWatchlistCount(ids.length);
  setUpdatedLabel();

  if (!ids.length) {
    showEmpty("Your watchlist is empty. Add movies from Discover.");
    return;
  }

  clearGrid();

  let movies = [];
  try {
    movies = await Promise.all(
      ids.map((id) => fetchJson(buildUrl(`/movie/${id}`)))
    );
  } catch (error) {
    console.error(error);
    showEmpty("Unable to load your watchlist right now.");
    return;
  }

  movies
    .filter(Boolean)
    .forEach((movie, index) => {
      const card = createCard(movie);
      card.style.animationDelay = `${index * 40}ms`;
      watchlistGrid.append(card);
    });
}

loadWatchlist();
