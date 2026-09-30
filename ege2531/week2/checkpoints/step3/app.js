// Step 3 — JavaScript basics.
// Nothing changes on the page yet. Open the console (F12 → Console) to see the output.

// An array of objects. Each object is one facility, like a Python dict.
// Coordinates are kept as lon and lat so there is no doubt which is which.
const facilities = [
  { name: "Juja Level 5 Hospital", level: 5, beds: 301, operational: true, lon: 36.673763, lat: -0.804421 },
  { name: "Ruiru Health Centre", level: 3, beds: 32, operational: true, lon: 36.71698, lat: -0.893475 },
  { name: "Kikuyu Health Centre", level: 3, beds: 45, operational: false, lon: 36.846252, lat: -0.985171 },
  { name: "Juja Dispensary", level: 2, beds: 2, operational: true, lon: 36.671381, lat: -1.186882 },
  { name: "Githunguri Sub-County Hospital", level: 4, beds: 135, operational: true, lon: 36.942477, lat: -1.084828 },
];

console.log("Number of facilities:", facilities.length);
console.log("The first one:", facilities[0]);
console.log("Its name:", facilities[0].name);

// A function. Backticks make a template literal: ${...} is Python's f-string {...}.
function describe(facility) {
  return `${facility.name} is level ${facility.level} with ${facility.beds} beds`;
}

// Loop over the array. "for...of" is Python's "for ... in".
for (const f of facilities) {
  console.log(describe(f));
}

// Keep only some items. The arrow function f => ... is Python's lambda f: ...
const hospitals = facilities.filter(f => f.level >= 4);
console.log("Level 4 and above:", hospitals.length);

// Add up a column. let, not const, because total changes.
let totalBeds = 0;
for (const f of facilities) {
  totalBeds = totalBeds + f.beds;
}
console.log("Total beds:", totalBeds);

// === compares value AND type. == converts types first, and surprises you.
console.log("3 === '3' is", 3 === "3");   // false
console.log("3 == '3' is", 3 == "3");     // true — this is why we never use ==
