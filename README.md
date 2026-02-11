# YeahMovies

Static movie discovery UI powered by TMDB.

## Project Structure
- `index.html` - Discover landing page.
- `404.html` - Custom 404 for static hosts (kept at root for GitHub Pages).
- `pages/` - App pages (Genres, Top Rated, Watchlist, Movie Details, About).
- `assets/css/` - Stylesheets.
- `assets/js/` - Front-end scripts.

## Deploy to GitHub Pages
1. Create a new GitHub repo and push this folder.
2. In GitHub, go to **Settings** -> **Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main` and folder: `/root`.
5. Save, then open the provided Pages URL.

## Local Run
Use a local static server so API calls work correctly.

Example (PowerShell):
```powershell
python -m http.server 5500
```
Then open `http://localhost:5500/`.
