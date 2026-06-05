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

const genreChips = document.getElementById("genreChips");
const genreStats = document.getElementById("genreStats");
const resultsCount = document.getElementById("resultsCount");
const categoryLabel = document.getElementById("categoryLabel");
const updatedLabel = document.getElementById("updatedLabel");
const sortSelect = document.getElementById("sortSelect");
const yearSelect = document.getElementById("yearSelect");
const sectionTitle = document.getElementById("sectionTitle");
const genreGrid = document.getElementById("genreGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const scrollToResultsBtn = document.getElementById("scrollToResults");

const state = {
  genreId: null,
  genreName: "",
  page: 1,
  totalPages: 1,
  sort: sortSelect ? sortSelect.value : "popularity.desc",
  year: "",
};

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

function setResultsCount(value) {
  if (!resultsCount) return;
  const count = Number.isFinite(value) ? value : 0;
  resultsCount.textContent = count.toLocaleString("en-US");
}

function setCategoryLabel(value) {
  if (!categoryLabel) return;
  categoryLabel.textContent = value || "Select";
}

function setUpdatedLabel() {
  if (!updatedLabel) return;
  updatedLabel.textContent = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function setSectionTitle(value) {
  if (!sectionTitle) return;
  sectionTitle.textContent = value || "Genre picks";
}

function clearGrid() {
  if (!genreGrid) return;
  genreGrid.innerHTML = "";
}

function showEmpty(message) {
  if (!genreGrid) return;
  genreGrid.innerHTML = `<div class="empty-state">${message}</div>`;
}

function buildUrl(path, params = {}) {
  const url = new URL(`${config.baseUrl}${path}`);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("include_adult", "false");
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
  watchlistBtn.textContent = isInWatchlist(movie.id)
    ? "In watchlist"
    : "Add to watchlist";
  watchlistBtn.addEventListener("click", (event) => {
    event.preventDefault();
    toggleWatchlist(movie.id);
    watchlistBtn.textContent = isInWatchlist(movie.id)
      ? "In watchlist"
      : "Add to watchlist";
  });

  card.append(link, watchlistBtn);
  return card;
}

function renderMovies(list, append = false) {
  if (!genreGrid) return;
  if (!append) clearGrid();
  if (!list.length) {
    showEmpty("No movies found for this genre.");
    return;
  }
  list.forEach((movie, index) => {
    const card = createCard(movie);
    card.style.animationDelay = `${index * 40}ms`;
    genreGrid.append(card);
  });
}

function populateYears() {
  if (!yearSelect) return;
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1950; year -= 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.append(option);
  }
}

function setActiveChip(target) {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip === target);
  });
}

function updateGenreStats() {
  if (!genreStats) return;
  genreStats.innerHTML = "";
  const items = [
    { label: "Selected", value: state.genreName || "--" },
    { label: "Sort", value: sortSelect ? sortSelect.selectedOptions[0].text : "" },
  ];
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "hero-card-item";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("span");
    value.textContent = item.value || "--";
    row.append(label, value);
    genreStats.append(row);
  });
}

async function loadGenres() {
  let data = null;
  try {
    data = await fetchJson(buildUrl("/genre/movie/list"));
  } catch (error) {
    console.error(error);
    if (genreChips) {
      genreChips.innerHTML =
        '<div class="empty-state">Unable to load genres.</div>';
    }
    return;
  }

  const genres = Array.isArray(data.genres) ? data.genres : [];
  if (!genres.length) return;

  if (genreChips) {
    genreChips.innerHTML = "";
    genres.forEach((genre, index) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = genre.name;
      chip.dataset.genreId = String(genre.id);
      chip.addEventListener("click", () => {
        state.genreId = genre.id;
        state.genreName = genre.name;
        state.page = 1;
        setActiveChip(chip);
        loadMovies();
      });
      if (index === 0) {
        state.genreId = genre.id;
        state.genreName = genre.name;
        chip.classList.add("is-active");
      }
      genreChips.append(chip);
    });
  }

  loadMovies();
}

async function loadMovies({ append = false } = {}) {
  if (!state.genreId) {
    showEmpty("Select a genre to see movies.");
    return;
  }

  const params = {
    with_genres: state.genreId,
    sort_by: state.sort,
    primary_release_year: state.year,
    page: state.page,
  };

  let data = null;
  try {
    data = await fetchJson(buildUrl("/discover/movie", params));
  } catch (error) {
    console.error(error);
    showEmpty("Unable to load movies right now.");
    return;
  }

  const list = Array.isArray(data.results) ? data.results : [];
  renderMovies(list, append);

  state.totalPages = data.total_pages || 1;
  setResultsCount(data.total_results ?? list.length);
  setCategoryLabel(state.genreName || "Select");
  setSectionTitle(`${state.genreName || "Genre"} picks`);
  setUpdatedLabel();
  updateGenreStats();

  if (loadMoreBtn) {
    loadMoreBtn.disabled = state.page >= state.totalPages;
  }
}

function handleFilterChange() {
  state.sort = sortSelect ? sortSelect.value : state.sort;
  state.year = yearSelect ? yearSelect.value : state.year;
  state.page = 1;
  loadMovies();
}

function handleLoadMore() {
  if (state.page >= state.totalPages) return;
  state.page += 1;
  loadMovies({ append: true });
}

function bindEvents() {
  if (sortSelect) sortSelect.addEventListener("change", handleFilterChange);
  if (yearSelect) yearSelect.addEventListener("change", handleFilterChange);
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", handleLoadMore);
  if (scrollToResultsBtn) {
    scrollToResultsBtn.addEventListener("click", () => {
      document
        .getElementById("genreResults")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function init() {
  populateYears();
  bindEvents();
  loadGenres();
}

init();
