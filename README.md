# BLIND RANK — Tamil Cinema Edition

A responsive, cinematic Tamil-cinema-only blind ranking game prototype.

## Run locally (Windows 11)

1. Extract `BLIND-RANK-Tamil-Cinema.zip`.
2. Open the extracted folder in VS Code.
3. Install the VS Code extension **Live Server**.
4. Right-click `index.html` → **Open with Live Server**.

Or use a simple local server:
```bash
npx serve .
```
Then open the local URL shown in the terminal.

## Included

- 15 Tamil cinema categories with an expanded hand-curated starter pool (the catalogue is a demo seed, not a live-scraped or authoritative database).
- Category → challenge → 10-item blind ranking flow.
- Ten fixed slots; once an item is placed, it cannot be moved.
- Results reveal and copyable result summary.
- Local player history and demo leaderboard.
- Admin Studio for adding items and importing CSV.
- Responsive dark cinematic UI, motion and optional sound cue.

## Important prototype limitations

This ZIP is a working **front-end prototype**. Data and player history are stored in the current browser using `localStorage`; they are not shared between devices or users. The leaderboard is therefore a local demo, not a real global community leaderboard.

Google Login is not connected. To enable it, configure Google OAuth / Firebase Authentication and a trusted backend. For production, connect a database (for example MongoDB Atlas), secure admin authentication, server-side game validation, and shared community aggregation.

The starter content is a curated demo catalogue. Review names, years, descriptions, and any media rights before public launch. The visual cards use generated CSS artwork rather than unlicensed movie posters. Add properly licensed images through a future media-upload workflow.

## CSV format

```csv
category,name,year,description
Actors,Example Actor,2024,Sample description
Movies,Example Film,2023,Sample film description
```

Category may be the category name (e.g. `Actors`, `Movies`, `Music Directors`) or its internal ID (`actors`, `movies`, `music`).

## Structure

```text
blind-rank-tamil-cinema/
├── index.html
├── css/style.css
├── js/data.js
├── js/app.js
└── README.md
```


## Updated visual direction

The refreshed theme is intentionally colourful and playful, taking broad inspiration from party card-game energy (not copying UNO's branding or card artwork). It uses bright colour-coded category cards, warm gradients, rounded playful controls, animated card entrances, and a cinematic Tamil-film identity.

## Content provenance

The expanded sample catalogue is manually curated starter content included in this prototype. It is not represented as scraped from external sources. Before public release, verify every title, year, credit, scene description, and pairing against reliable film databases and rights-holder sources. The current app does not automatically fetch or scrape third-party content.


## Individual artist filmography mode (new)

For Actors, Actresses and Directors, the category opens a searchable people directory. Selecting an individual opens that person's profile and filmography. The profile divides films into sequential batches of 10. Completed films are recorded in local browser storage per person, so later batches exclude previously completed titles on that device.

The included people dataset is a starter catalogue with individual profiles for selected Tamil cinema artists. It is not yet an exhaustive database of every artist or every credited film. Expand `js/people-data.js` with verified filmography records. Do not treat an artist's filmography as complete unless it has been researched and checked against reliable sources. Current localStorage progress is device/browser-specific and can be cleared by the user.
