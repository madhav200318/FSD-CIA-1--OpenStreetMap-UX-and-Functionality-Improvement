# ◉ GeoFind – Smart Location Search

**FSD CIA 1 – OpenStreetMap UX and Functionality Improvement Challenge**

A responsive web app that improves location search on OpenStreetMap through
autocomplete and clearer results. It shows a full-screen live map with the search
panel on the side, just like openstreetmap.org, in an abstract blue theme.

🔗 **Live demo:** https://github.com/madhav200318/FSD-CIA-1--OpenStreetMap-UX-and-Functionality-Improvement


## Problem

Users find it hard to identify the correct location when they search for places with
similar names or several possible matches (for example Springfield, Paris or Cambridge).

## Solution: Smart Location Search

- Instant **autocomplete suggestions** while typing, showing region, country and place type
- **"Similar name – check region"** tag on results that share a name, plus a country flag and full address
- Selecting a result **highlights its card and map pin**, zooms the map to it and shows a preview with coordinates
- **"Open in OSM"** and **"Plan route here"** links for exploring or routing
- Validation and clear feedback for invalid searches
- Loading, empty, error (with Retry) and success states, so the results area is never blank
- Fully responsive: the side panel collapses on mobile

## Target users

Tourists, travellers, delivery workers and other everyday map users.

## Tech stack

- HTML5
- JavaScript (vanilla)
- Tailwind CSS (CDN)
- Leaflet + OpenStreetMap tiles
- Nominatim geocoding API (Fetch API, JSON)

## JavaScript events

| Event    | Where                  | What it does                                                        |
|----------|------------------------|---------------------------------------------------------------------|
| `input`  | Search field           | Shows suggestions instantly from a local JSON dataset               |
| `submit` | Search form            | Validates the query, then fetches real results from Nominatim       |
| `click`  | Result card / map pin  | Selects the location, highlights it, moves the map, updates preview |

## Form validation

- Empty query → "Please enter a place name, street or address."
- Fewer than 2 characters → "Type at least 2 characters to search."
- More than 100 characters → "Your search is too long. Keep it under 100 characters."

## States

| State   | Message                                                                    |
|---------|----------------------------------------------------------------------------|
| Loading | Spinner and "Searching for locations…" (Go button disabled)                |
| Empty   | "No locations found. Try a different name or address."                     |
| Error   | "We couldn't load locations. Check your connection and try again." + Retry |
| Success | Location cards with details; the selected one is highlighted               |

## Screenshots

| Autocomplete | Selected result |
|--------------|-----------------|
| ![Autocomplete](images/autocomplete.png) | ![Selected](images/selected.png) |

## Project structure

```
osm-smart-search/
├── index.html        # page layout, side panel, case-study overlay
├── css/styles.css    # blue abstract theme, panel, pins, spinner
├── js/data.js        # local JSON dataset for autocomplete
├── js/app.js         # events, validation, fetch, states, map
└── README.md
```

## How to run

1. Download or clone this repository.
2. Open `index.html` in a browser (an internet connection is needed for the map and search).


## Credits

- Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- Geocoding by [Nominatim](https://nominatim.org/)
- Map library: [Leaflet](https://leafletjs.com/)

## Author

Your Name – Register No. – Class/Section