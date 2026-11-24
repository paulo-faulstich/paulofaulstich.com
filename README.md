# paulofaulstich.com

Personal site of Paulo Faulstich. Static HTML and CSS, no build step.

## Structure

- `index.html` — the whole page
- `assets/site.css` — base rules, hover/focus states, experience accordion
- `assets/` — portrait, project screenshot, favicon
- `CNAME` — custom domain for GitHub Pages

## Preview locally

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Hosted on GitHub Pages from the `main` branch root. Pushing to `main` publishes.
