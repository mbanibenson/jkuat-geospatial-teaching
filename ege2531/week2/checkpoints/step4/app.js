// Step 4 — the DOM and events.
// The facility list is now written by JavaScript, and the filters redraw it.

const facilities = [
  { name: "Juja Level 5 Hospital", level: 5, beds: 301, operational: true, lon: 36.673763, lat: -0.804421 },
  { name: "Ruiru Health Centre", level: 3, beds: 32, operational: true, lon: 36.71698, lat: -0.893475 },
  { name: "Kikuyu Health Centre", level: 3, beds: 45, operational: false, lon: 36.846252, lat: -0.985171 },
  { name: "Juja Dispensary", level: 2, beds: 2, operational: true, lon: 36.671381, lat: -1.186882 },
  { name: "Githunguri Sub-County Hospital", level: 4, beds: 135, operational: true, lon: 36.942477, lat: -1.084828 },
];

// Find the elements once. querySelector takes a CSS selector — the same ones as style.css.
const levelSelect = document.querySelector("#level-select");
const operationalBox = document.querySelector("#operational-only");
const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#facility-list");

// Does this facility pass the current filters?
function matchesFilters(facility) {
  const minLevel = Number(levelSelect.value);   // .value is always a string
  if (facility.level < minLevel) return false;
  if (operationalBox.checked && !facility.operational) return false;
  return true;
}

// Redraw the list from the data. Called at the start and after every change.
function render() {
  const shown = facilities.filter(matchesFilters);
  statusEl.textContent = `Showing ${shown.length} of ${facilities.length} facilities`;

  listEl.innerHTML = "";                         // empty the list
  for (const f of shown) {
    const li = document.createElement("li");     // make a new <li>
    li.textContent = `${f.name} — level ${f.level}, ${f.beds} beds`;
    if (!f.operational) li.classList.add("closed");
    listEl.appendChild(li);                      // put it in the <ul>
  }
}

// Events: "when this control changes, run render".
levelSelect.addEventListener("change", render);
operationalBox.addEventListener("change", render);

render();
