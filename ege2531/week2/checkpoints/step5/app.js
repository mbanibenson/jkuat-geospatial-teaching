// Step 5 — fetch, promises and async/await.
// The five hand-typed facilities are gone: all 60 now come from the GeoJSON file.

const DATA_URL = "data/facilities.geojson";

let facilities = [];   // empty until the file has arrived

const levelSelect = document.querySelector("#level-select");
const operationalBox = document.querySelector("#operational-only");
const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#facility-list");

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
