// =======================
// MAP INITIALIZATION
// =======================
const map = L.map('map').setView([9.93, -84.08], 13);

map.setMaxBounds([
  [9.85, -84.25],  // southwest corner
  [10.05, -83.90]  // northeast corner
]);

 L.tileLayer('./tiles/{z}/{x}/{y}.png', {
  maxZoom: 12,
  minZoom: 12,
  attribution: 'Offline Map'
}).addTo(map);


map.on("click", function(e){
  console.log(e.latlng);
});

// =======================
// GLOBAL VARIABLES
// =======================

let userLocation = null;
let selectedDestination = null;
let routeLayers = [];


// =======================
// SKATEPARK LIST
// =======================

const skateparks = [
  {
    name: "Los Lagos Skatepark",
    lat: 9.974303, 
    lng: -84.114172,
    description: "Heredia"
  },
  {
    name: "Plaza Cleto González Víquez Skatepark",
    lat: 9.925516, 
    lng: -84.074012,
    description: "San José Centro"
  },
  {
    name: "Guachipelín Skatepark",
    lat: 9.937716, 
    lng: -84.152627,
    description: "Escazú"
  },
  {
    name: "Moravia Skatepark",
    lat: 9.962277, 
    lng: -84.049416,
    description: "Moravia"
  },
  {
    name: "Parque José María Zeledón Skatepark",
    lat: 9.918421, 
    lng: -84.040928,
    description: "Hatillo"
  },
  {
    name: "Salvador del Mundo Skatepark",
    lat: 9.941122, 
    lng: -84.097169,
    description: "San José"
  },
  {
    name: "Alajuelita Skatepark",
    lat: 9.902849, 
    lng: -84.100284,
    description: "Alajuelita"
  },
  {
    name: "Plaza Barrio Pinto",
    lat: 9.928221,
    lng: -84.045588,
    description: "San José, Barrio Pinto, Costa Rica"
  },
  {
    name: "Lindora Skatepark",
    lat: 9.959273, 
    lng:-84.205413,
    description: "Santa Ana"
  },
  {
    name: "Zapote Skatepark", 
    lat: 9.921427, 
    lng:  -84.050931,
    description: "Zapote"
  },
  {
    name: "Tecma Skatepark",
    lat: 9.942895,
    lng: -84.048910,
    description: "Tecma Skatepark", 
} 
];

// =======================
// ADD SKATEPARK MARKERS
// =======================

skateparks.forEach(park => {

  const marker = L.marker([park.lat, park.lng])
    .addTo(map)
    .bindPopup(`<b>${park.name}</b><br>${park.description}`);

  marker.on("click", () => {
    selectedDestination = park;
    drawMainRoute();
  });

});


// =======================
// GET USER LOCATION
// =======================

navigator.geolocation.getCurrentPosition(position => {

  userLocation = [
    position.coords.latitude,
    position.coords.longitude
  ];

  L.marker(userLocation)
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  map.setView(userLocation, 13);

}, () => {
  alert("Please enable location access.");
});


// =======================
// CLEAR ROUTES
// =======================

function clearRoutes() {
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];
}


// =======================
// FIND NEAREST SKATEPARK
// =======================

function findNearestSkatepark() {

  if (!userLocation) {
    alert("Waiting for your location...");
    return;
  }

  let nearest = null;
  let minDistance = Infinity;

  skateparks.forEach(park => {

    const distance = map.distance(
      userLocation,
      [park.lat, park.lng]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = park;
    }
  });

  selectedDestination = nearest;

  L.popup()
    .setLatLng([nearest.lat, nearest.lng])
    .setContent(`🔥 Nearest Skatepark:<br><b>${nearest.name}</b><br>Distance: ${(minDistance/1000).toFixed(2)} km`)
    .openOn(map);

  drawMainRoute();
}


// =======================
// DRAW MAIN ROUTE
// =======================

// ONLINE ROUTING
function drawMainRoute() {

  if (!selectedDestination || !navigator.onLine) {
    alert("You must be online to calculate routes.");
    return;
  }

  clearRoutes();

  // OFFLINE FALLBACK
  if (!navigator.onLine) {

    const line = L.polyline([
      userLocation,
      [selectedDestination.lat, selectedDestination.lng]
    ], {
      color: "blue",
      weight: 5
    }).addTo(map);

    routeLayers.push(line);

    L.popup()
      .setLatLng([selectedDestination.lat, selectedDestination.lng])
      .setContent(`
        🛹 <b>${selectedDestination.name}</b><br>
        📡 Offline mode<br>
        📏 Direct path (no roads)
      `)
      .openOn(map);

    return;
  }

   //ONLINE-ROUTING

  const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination.lng},${selectedDestination.lat}?overview=full&alternatives=false&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      if (!data.routes || data.routes.length === 0) {
        alert("Route not found.");
        return;
      }

      const route = data.routes[0];

      // 🔹 Convert distance + time
      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationMin = Math.round(route.duration / 60);


      const layer = L.geoJSON(route.geometry, {
        style: {
          color: "blue",
          weight: 5
        }
      }).addTo(map);

      routeLayers.push(layer);
       L.popup()
        .setLatLng([selectedDestination.lat, selectedDestination.lng])
        .setContent(`
          🛹 <b>${selectedDestination.name}</b><br>
          📏 Distance: ${distanceKm} km<br>
          ⏱️ Time: ~${durationMin} minutes
        `)
        .openOn(map);
    })
    .catch(err => {
      console.error("Routing error:", err);
    });
}


// =======================
// DRAW ALTERNATIVE ROUTES
// =======================

function drawAlternativeRoutes() {

  if (!userLocation) {
    alert("Waiting for your location...");
    return;
  }

  if (!selectedDestination || !navigator.onLine) {
    alert("Please select a skatepark first.");
    return;
  }

  if (!navigator.onLine) {
    alert("You must be online to calculate routes.");
    return;
  }

  clearRoutes();

  const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination.lng},${selectedDestination.lat}?overview=full&alternatives=true&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      if (!data.routes || data.routes.length === 0) {
        alert("No alternative routes found.");
        return;
      }

      data.routes.forEach((route, index) => {

          const distanceKm = (route.distance / 1000).toFixed(2);
          const durationMin = Math.round(route.duration / 60);

        const layer = L.geoJSON(route.geometry, {
          style: {
            color: index === 0 ? "blue" : "green",
            weight: 5
          }

    }).addTo(map);
           routeLayers.push(layer);
           console.log(`Route ${index + 1}: ${distanceKm} km - ${durationMin} min`);
      });
    })
        .catch(err => {
         console.error("Routing error:", err);
    });
}


// =======================
// CONNECT BUTTONS
// =======================

document.getElementById("btn-1")
  .addEventListener("click", findNearestSkatepark);

document.getElementById("btn-2")
  .addEventListener("click", drawAlternativeRoutes);