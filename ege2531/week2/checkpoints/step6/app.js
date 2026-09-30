// Step 6 — plotting the facilities without a mapping library.
// Same as step 5, plus drawDots(): longitude/latitude become positions in the #map box.

const DATA_URL = "data/facilities.geojson";

let facilities = [];   // empty until the file has arrived

const levelSelect = document.querySelector("#level-select");
const operationalBox = document.querySelector("#operational-only");
const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#facility-list");
const mapEl = document.querySelector("#map");

// The box of the world we are drawing: roughly Kiambu County, in degrees.
const BOUNDS = { west: 36.5, east: 37.4, south: -1.35, north: -0.75 };

function matchesFilters(facility) {
  const minLevel = Number(levelSelect.value);
  if (facility.level < minLevel) return false;
  if (operationalBox.checked && !facility.operational) return false;
  return true;
}

function render() {
  const shown = facilities.filter(matchesFilters);
  statusEl.textContent = `Showing ${shown.length} of ${facilities.length} facilities`;

  listEl.innerHTML = "";
  for (const f of shown) {
    const li = document.createElement("li");
    li.textContent = `${f.name} — level ${f.level}, ${f.beds} beds`;
    if (!f.operational) li.classList.add("closed");
    listEl.appendChild(li);
  }

  drawDots(shown);
}

// Place one dot per facility. left/top are percentages of the #map box.
function drawDots(list) {
  mapEl.innerHTML = "";
  for (const f of list) {
    const x = (f.lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west);    // 0 at west edge, 1 at east
    const y = (BOUNDS.north - f.lat) / (BOUNDS.north - BOUNDS.south); // 0 at top, 1 at bottom: screens count downwards

    const dot = document.createElement("div");
    dot.className = `dot level-${f.level}`;
    dot.style.left = `${x * 100}%`;
    dot.style.top = `${y * 100}%`;
    dot.title = `${f.name} (level ${f.level})`;   // hover to see the name
    if (!f.operational) dot.classList.add("closed");
    mapEl.appendChild(dot);
  }
}

// Turn one GeoJSON Feature into the flat object the rest of the code expects.
// GeoJSON coordinates are [longitude, latitude] — x first, then y.
function toFacility(feature) {
  const p = feature.properties;
  return {
    name: p.name,
    level: p.level,
    beds: p.beds,
    operational: p.operational,
    lon: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
  };
}

// async lets us write await: "pause THIS function until the promise settles".
// The rest of the page keeps running while we wait.
async function loadFacilities() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      // fetch does NOT fail on a 404 — we have to check ourselves
      throw new Error(`HTTP ${response.status}`);
    }
    const geojson = await response.json();
    facilities = geojson.features.map(toFacility);
    render();          // only now is there anything to draw
  } catch (err) {
    statusEl.textContent = `Could not load the facilities (${err.message}). Is Live Server running, and is the file in data/?`;
    statusEl.classList.add("error");
    console.error(err);
  }
}

levelSelect.addEventListener("change", render);
operationalBox.addEventListener("change", render);

loadFacilities();
