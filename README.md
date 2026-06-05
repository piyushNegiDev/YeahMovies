# YeahMovies

YeahMovies is a static movie discovery web app powered by the TMDB API. It lets users browse current releases, trending movies, genre collections, top-rated titles, and detailed movie pages from a polished front-end interface.

## Features

- Discover upcoming, now playing, popular, top-rated, and trending movies.
- Search by movie title or actor.
- Filter movies by sort order, release year, and genre.
- View detailed movie pages with poster/backdrop artwork and metadata.
- Save movies to a local browser watchlist with `localStorage`.
- Browse dedicated Genres, Top Rated, Watchlist, About, and 404 pages.
- Deploy as a static site with GitHub Pages.

## Project Structure

```text
.
+-- index.html
+-- 404.html
+-- pages/
|   +-- about.html
|   +-- genres.html
|   +-- movie-details.html
|   +-- top-rated.html
|   +-- watchlist.html
+-- assets/
|   +-- css/
|   +-- js/
+-- .nojekyll
+-- LICENSE
+-- README.md
```

## Tech Stack

- HTML
- CSS
- JavaScript
- TMDB API
- Browser `localStorage`

## Local Run

Use a local static server so the pages and API requests work consistently.

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. Open the repository settings.
3. Go to **Pages**.
4. Set the source to **Deploy from a branch**.
5. Choose the `main` branch and `/root` folder.
6. Save and open the generated GitHub Pages URL.

The `.nojekyll` file is included so GitHub Pages serves the static files directly.

## Notes

- Movie data and images are provided by TMDB.
- The watchlist is stored locally in the user's browser, not on a server.
- This project is a front-end demo and does not include user accounts or authentication.
