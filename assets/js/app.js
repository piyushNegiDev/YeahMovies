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

const watchlistKey = "yeahmovies:watchlist";
const fallbackPoster =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

const container = document.getElementById("container");
const trendingGrid = document.getElementById("trendingGrid");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchType = document.getElementById("searchType");
const resultsCount = document.getElementById("resultsCount");
const categoryLabel = document.getElementById("categoryLabel");
const updatedLabel = document.getElementById("updatedLabel");
const sortSelect = document.getElementById("sortSelect");
const yearSelect = document.getElementById("yearSelect");
const genreSelect = document.getElementById("genreSelect");
const sectionTitle = document.getElementById("sectionTitle");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const viewTrendingBtn = document.getElementById("viewTrendingBtn");
const exploreDropBtn = document.getElementById("exploreDropBtn");
const contentSection = document.querySelector(".content");

const state = {
  endpoint: "upcoming",
  mode: "list",
  page: 1,
  totalPages: 1,
  query: "",
  searchType: "movie",
  sort: sortSelect ? sortSelect.value : "popularity.desc",
  year: "",
  genre: "",
  actorId: null,
  actorName: "",
};

const endpointLabels = {
  upcoming: "Upcoming",
  now_playing: "Now Playing",
  popular: "Popular",
  top_rated: "Top Rated",
  trending: "Trending",
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
  categoryLabel.textContent = value || "Browse";
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
  sectionTitle.textContent = value || "Movies";
}

function clearGrid(target) {
  if (!target) return;
  target.innerHTML = "";
}

function scrollToResults() {
  contentSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showEmpty(target, message) {
  if (!target) return;
  target.innerHTML = `<div class="empty-state">${message}</div>`;
}

function createCard(movie) {
  const card = document.createElement("article");
  card.className = "card";

  const link = document.createElement("a");
  link.className = "card-link";
  link.href = movie.id ? `pages/movie-details.html?id=${movie.id}` : "#";
  link.setAttribute("aria-label", `${movie.title || "Movie"} details`);

  const img = document.createElement("img");
  img.alt = movie.title || movie.name || "Movie poster";
  img.src = movie.poster_path
    ? `${config.imageBase}${movie.poster_path}`
    : fallbackPoster;

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = movie.title || movie.name || "Untitled";

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const date = document.createElement("span");
  date.textContent = formatDate(movie.release_date || movie.first_air_date);

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

function renderMovies(target, list, append = false) {
  if (!target) return;
  if (!append) clearGrid(target);
  if (!list.length) {
    showEmpty(target, "No results found.");
    return;
  }
  list.forEach((movie, index) => {
    const card = createCard(movie);
    card.style.animationDelay = `${index * 40}ms`;
    target.append(card);
  });
}

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateISO(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchJson(url) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
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

function isFiltersActive() {
  return Boolean(state.sort !== "popularity.desc" || state.year || state.genre);
}

function buildMainRequest() {
  if (state.mode === "trending") {
    return {
      url: buildUrl("/trending/movie/week", { page: state.page }),
      label: "Trending",
      title: "Trending this week",
    };
  }

  if (state.mode === "search") {
    return {
      url: buildUrl("/search/movie", {
        query: state.query,
        page: state.page,
      }),
      label: "Search",
      title: `Search results for "${state.query}"`,
    };
  }

  if (state.mode === "actor") {
    if (!state.actorId) return null;
    return {
      url: buildUrl("/discover/movie", {
        with_cast: state.actorId,
        sort_by: "popularity.desc",
        page: state.page,
      }),
      label: "Actor",
      title: `Movies with ${state.actorName || "selected actor"}`,
    };
  }

  if (isFiltersActive() || state.mode === "discover") {
    const params = {
      sort_by: state.sort,
      primary_release_year: state.year,
      with_genres: state.genre,
      page: state.page,
    };
    if (state.endpoint === "upcoming") {
      params["primary_release_date.gte"] = getDateISO(0);
    }
    if (state.endpoint === "now_playing") {
      params["primary_release_date.gte"] = getDateISO(-45);
      params["primary_release_date.lte"] = getDateISO(0);
    }
    return {
      url: buildUrl("/discover/movie", params),
      label: "Discover",
      title: "Curated picks",
    };
  }

  return {
    url: buildUrl(`/movie/${state.endpoint}`, { page: state.page }),
    label: endpointLabels[state.endpoint] || "Browse",
    title: `${endpointLabels[state.endpoint] || "Browse"} releases`,
  };
}

async function loadMain({ append = false, scroll = false } = {}) {
  if (!container) return;
  const request = buildMainRequest();
  if (!request || !request.url) return;

  if (!append) clearGrid(container);

  let data = null;
  try {
    data = await fetchJson(request.url);
  } catch (error) {
    console.error(error);
    showEmpty(container, "Unable to load movies right now.");
    return;
  }

  const list = Array.isArray(data.results) ? data.results : [];
  renderMovies(container, list, append);

  state.totalPages = data.total_pages || 1;
  setResultsCount(data.total_results ?? list.length);
  setUpdatedLabel();
  setCategoryLabel(request.label);
  setSectionTitle(request.title);

  if (loadMoreBtn) {
    loadMoreBtn.disabled = state.page >= state.totalPages;
  }

  if (scroll) {
    scrollToResults();
  }
}

async function loadTrending() {
  if (!trendingGrid) return;
  clearGrid(trendingGrid);

  let data = null;
  try {
    data = await fetchJson(buildUrl("/trending/movie/week"));
  } catch (error) {
    console.error(error);
    showEmpty(trendingGrid, "Unable to load trending movies.");
    return;
  }

  const list = Array.isArray(data.results) ? data.results.slice(0, 6) : [];
  renderMovies(trendingGrid, list);
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

async function populateGenres() {
  if (!genreSelect) return;
  let data = null;
  try {
    data = await fetchJson(buildUrl("/genre/movie/list"));
  } catch (error) {
    console.error(error);
    return;
  }
  const genres = Array.isArray(data.genres) ? data.genres : [];
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = String(genre.id);
    option.textContent = genre.name;
    genreSelect.append(option);
  });
}

async function resolveActor(query) {
  const data = await fetchJson(
    buildUrl("/search/person", { query, page: 1 })
  );
  const person = Array.isArray(data.results) ? data.results[0] : null;
  if (!person) return null;
  return { id: person.id, name: person.name };
}

function setActiveChip(target) {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip === target);
  });
}

function handleSearchSubmit(event) {
  event.preventDefault();
  if (!searchInput) return;
  const query = searchInput.value.trim();
  if (!query) return;

  state.page = 1;
  state.query = query;
  state.searchType = searchType ? searchType.value : "movie";

  if (state.searchType === "actor") {
    state.mode = "actor";
    state.actorId = null;
    state.actorName = "";
    resolveActor(query)
      .then((actor) => {
        if (!actor) {
          showEmpty(container, "No actor found for that search.");
          setResultsCount(0);
          setCategoryLabel("Actor");
          setSectionTitle("Actor search");
          return;
        }
        state.actorId = actor.id;
        state.actorName = actor.name;
        loadMain({ scroll: true });
      })
      .catch((error) => {
        console.error(error);
        showEmpty(container, "Unable to search for actors right now.");
      });
    return;
  }

  state.mode = "search";
  loadMain({ scroll: true });
}

function handleFilterChange() {
  state.sort = sortSelect ? sortSelect.value : state.sort;
  state.year = yearSelect ? yearSelect.value : state.year;
  state.genre = genreSelect ? genreSelect.value : state.genre;
  state.page = 1;
  state.mode = isFiltersActive() ? "discover" : "list";
  loadMain({ scroll: true });
}

function handleChipClick(event) {
  const chip = event.currentTarget;
  const endpoint = chip.dataset.endpoint;
  if (!endpoint) return;
  state.endpoint = endpoint;
  state.page = 1;
  state.mode = isFiltersActive() ? "discover" : "list";
  setActiveChip(chip);
  loadMain({ scroll: true });
}

function handleLoadMore() {
  if (state.page >= state.totalPages) return;
  state.page += 1;
  loadMain({ append: true });
}

function handleViewTrending() {
  state.mode = "trending";
  state.page = 1;
  loadMain();
  document.querySelector(".content")?.scrollIntoView({ behavior: "smooth" });
}

function handleExploreDrop() {
  document.querySelector(".spotlight")?.scrollIntoView({
    behavior: "smooth",
  });
}

function bindEvents() {
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchSubmit);
  }
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", handleChipClick);
  });
  if (sortSelect) sortSelect.addEventListener("change", handleFilterChange);
  if (yearSelect) yearSelect.addEventListener("change", handleFilterChange);
  if (genreSelect) genreSelect.addEventListener("change", handleFilterChange);
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", handleLoadMore);
  if (viewTrendingBtn) viewTrendingBtn.addEventListener("click", handleViewTrending);
  if (exploreDropBtn) exploreDropBtn.addEventListener("click", handleExploreDrop);
}

function init() {
  populateYears();
  populateGenres();
  bindEvents();
  loadTrending();
  loadMain();
}

init();
