// =======================
// MAP
// =======================

document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("map");

  if (!mapElement || typeof L === "undefined") {
    console.error("Map element or Leaflet not loaded");
    return;
  }

  let map = null;
  let tileLayer = null;
  let mapInitialized = false;

  let userLocation = null;
  let selectedDestination = null;
  let routeLayers = [];
  let currentRoute = null;
  let selectedMarker = null;

const defaultIcon = L.icon({
    iconUrl: "icons/skate-blue.svg",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45]
});

const activeIcon = L.icon({
    iconUrl: "icons/skate-active.svg",
    iconSize: [46, 58],
    iconAnchor: [23, 58],
    popupAnchor: [0, -52]
});


// == SKATE MARKERS == //
 
function addSkateparkMarkers() {

  skateparks.forEach((park) => {

    const marker = L.marker(
      [park.lat, park.lng],
      { icon: defaultIcon }
    ).addTo(map);

    park.marker = marker;

    marker.on("click", () => {

      if (selectedMarker) {
        selectedMarker.setIcon(defaultIcon);
      }

      marker.setIcon(activeIcon);

      selectedMarker = marker;

      selectedDestination = park;

      drawMainRoute();

    });

  });

}

  // =======================
  // INIT MAP
  // =======================

  function initMap() {
    if (mapInitialized) return;

    map = L.map("map").setView([9.93, -84.08], 11);

    map.setMaxBounds([
      [9.85, -84.25],
      [10.05, -83.90]
    ]);

    loadTiles();

    map.on("click", (e) => {
      console.log("Clicked:", e.latlng);
    });

    mapInitialized = true;
  }

  // =======================
  // TILE HANDLING
  // =======================

  function loadTiles() {
    if (!map || tileLayer) return;

    tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
      }
    ).addTo(map);
  }

  function removeTiles() {
    if (!map || !tileLayer) return;

    map.removeLayer(tileLayer);
    tileLayer = null;
  }

  // =======================
  // SKATEPARKS
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
      name: "Turba Skatepark (El Patio de Bryan)",
      lat: 9.896363,
      lng: -84.111380,
      description: "VVWQ+GF6, San José, Alajuelita, Costa Rica"
    },
    {
      name: "Barrio Pinto Skatepark",
      lat: 9.9279,
      lng: -84.0366,
      description: "WXH3+9R8, San José, San Pedro, Barrio Pinto, 11801"
    },
    {
      name: "Lindora Skatepark",
      lat: 9.959273,
      lng: -84.205413,
      description: "Santa Ana"
    },
    {
      name: "Zapote Skatepark",
      lat: 9.921427,
      lng: -84.050931,
      description: "Zapote"
    },
    {
      name: "Tecma Skatepark",
      lat: 9.942895,
      lng: -84.048910,
      description: "Tecma Skatepark", 
   },
   {
     name: "Belén Skatepark",
     lat: 9.9786,
     lng: -84.1840,
     description: "XRMJ+2QM, Calle 112, Heredia, Belén, 40703"
   },
    {
    name: "San Ramón Skatepark",
    lat: 10.100109,
    lng: -84.473479,
    description: "3GXG+9X4, Provincia de Alajuela, San Ramón"
   }
  ];

  // =======================
  // ADD MARKERS
  // =======================

  function addSkateparkMarkers() {
    skateparks.forEach((park) => {
      const marker = L.marker([park.lat, park.lng])
        .addTo(map)
        .bindPopup(`<b>${park.name}</b><br>${park.description}`);

      marker.on("click", () => {

    if (selectedMarker) {
        selectedMarker.setIcon(defaultIcon);
    }

    marker.setIcon(activeIcon);

    selectedMarker = marker;

        selectedDestination = park;
        drawMainRoute();
      });
    });
  }

  // =======================
  // USER LOCATION
  // =======================

let firstLocation = true;

function getUserLocation() {

    navigator.geolocation.getCurrentPosition(position => {

        userLocation = [
            position.coords.latitude,
            position.coords.longitude
        ];

        L.marker(userLocation)
            .addTo(map)
            .bindPopup("📍 You are here");

        if (firstLocation) {

            map.setView(userLocation, 13);

            firstLocation = false;
        }

    });

}

// =======================
// ROUTES
// =======================

   function clearRoutes() {

  routeLayers.forEach(layer => {
    map.removeLayer(layer);
  });

  routeLayers = [];
  currentRoute = null;

  const card =
    document.getElementById("routeInfo");

  if (card) {
    card.classList.add("hidden");
  }

}

async function drawMainRoute() {

  if (!userLocation || !selectedDestination) return;

  clearRoutes();

  // -----------------------
  // OFFLINE
  // -----------------------

  if (!navigator.onLine) {

    const coordinates = [
      userLocation,
      [selectedDestination.lat, selectedDestination.lng]
    ];

    const distanceKm = (
      map.distance(
        userLocation,
        [selectedDestination.lat, selectedDestination.lng]
      ) / 1000
    ).toFixed(1);

    currentRoute = L.polyline(coordinates,{
      color:"#2979ff",
      weight:6
    }).addTo(map);

    currentRoute.bindTooltip(
      `📏 ${distanceKm} km`,
      {
        permanent:true,
        direction:"center",
        className:"route-label"
      }
    );

    routeLayers.push(currentRoute);

    showRouteInfo(
      selectedDestination.name,
      distanceKm,
      "--",
      "--",
      "--"
    );

   if (currentRoute) {

    map.fitBounds(currentRoute.getBounds(), {
        padding: [60, 60],
        maxZoom: 12
    });

}

    return;

  }

  // -----------------------
  // ONLINE
  // -----------------------

  try {

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${selectedDestination.lng},${selectedDestination.lat}` +
      `?overview=full&geometries=geojson`;

    const response = await fetch(url);

    const data = await response.json();

    if (!data.routes?.length) return;

    const route = data.routes[0];

    const coordinates =
      route.geometry.coordinates.map(
        ([lng,lat]) => [lat,lng]
      );

    const distanceKm =
      (route.distance / 1000).toFixed(1);

    const drive =
      Math.round(route.duration / 60);

    const bike =
      Math.round((distanceKm / 18) * 60);

    const walk =
      Math.round((distanceKm / 5) * 60);

    currentRoute = L.polyline(coordinates,{
      color:"#2979ff",
      weight:6
    }).addTo(map);

    currentRoute.bindTooltip(
      `📏 ${distanceKm} km`,
      {
        permanent:true,
        direction:"center",
        className:"route-label"
      }
    );

    routeLayers.push(currentRoute);

    showRouteInfo(
      selectedDestination.name,
      distanceKm,
      drive,
      bike,
      walk
    );

    if (Number(distanceKm) < 20) {

      map.fitBounds(
        currentRoute.getBounds(),
        {
          padding:[40,40]
        }
      );

    } else {

      map.flyTo(
        [selectedDestination.lat, selectedDestination.lng],
        12,
        {
          duration:1.5
        }
      );

    }

  }

  catch(err){

    console.error(err);

  }

}

function showRouteInfo(name, distance, drive, bike, walk) {

    L.popup({
        maxWidth: 260,
        closeButton: true
    })
    .setLatLng([
        selectedDestination.lat,
        selectedDestination.lng
    ])
    .setContent(`
        <div class="route-popup">

            <h3>🛹 ${name}</h3>

            <div class="route-stats">
                <span>📏 ${distance} km</span>
                <span>🚗 ${drive} min</span>
                <span>🚲 ${bike} min</span>
                <span>🚶 ${walk} min</span>
            </div>

            <div class="route-buttons">
                <button id="centerRoute">📍 Center</button>
                <button id="googleRoute">🧭 Google</button>
            </div>

        </div>
    `)
    .openOn(map);

    setTimeout(() => {

        document.getElementById("centerRoute")
        ?.addEventListener("click", () => {

            if (currentRoute) {
                map.fitBounds(currentRoute.getBounds(), {
                    padding:[40,40]
                });
            }

        });

        document.getElementById("googleRoute")
        ?.addEventListener("click", () => {

            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${selectedDestination.lat},${selectedDestination.lng}`,
                "_blank"
            );

        });

    },0);

}

async function drawAlternativeRoutes() {

  if (!userLocation) {
    alert("Waiting for your location...");
    return;
  }

  if (!selectedDestination) {
    alert("Please select a skatepark first.");
    return;
  }

  if (!navigator.onLine) {
    alert("You must be online.");
    return;
  }

  clearRoutes();

  try {

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${selectedDestination.lng},${selectedDestination.lat}` +
      `?overview=full&alternatives=true&geometries=geojson`;

    const response = await fetch(url);

    const data = await response.json();

    if (!data.routes?.length) {
      alert("No routes found.");
      return;
    }

    data.routes.forEach((route,index)=>{

      const coordinates =
        route.geometry.coordinates.map(
          ([lng,lat]) => [lat,lng]
        );

      const polyline = L.polyline(coordinates,{
        color:index===0 ? "#2979ff" : "#08550b",
        weight:5,
        opacity:index===0 ? 1 : 0.7
      }).addTo(map);

      routeLayers.push(polyline);

      if(index===0){

        currentRoute = polyline;

        const distanceKm =
          (route.distance/1000).toFixed(1);

        currentRoute.bindTooltip(
          `📏 ${distanceKm} km`,
          {
            permanent:true,
            direction:"center",
            className:"route-label"
          }
        );

        showRouteInfo(
          selectedDestination.name,
          distanceKm,
          Math.round(route.duration/60),
          Math.round((distanceKm/18)*60),
          Math.round((distanceKm/5)*60)
        );

      }

    });

    map.fitBounds(
      currentRoute.getBounds(),
      {
        padding:[40,40]
      }
    );

  }

  catch(err){

    console.error(err);

  }

}

  // =======================
  // FIND NEAREST
  // =======================

  function findNearestSkatepark() {
    if (!userLocation) {
      alert("Waiting for your location...");
      return;
    }

    let nearest = null;
    let minDistance = Infinity;

    skateparks.forEach((park) => {
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

    drawMainRoute();
  }

  // =======================
  // BUTTONS
  // =======================

  function connectButtons() {
    document
      .getElementById("btn-1")
      ?.addEventListener("click", findNearestSkatepark);

    document
      .getElementById("btn-2")
      ?.addEventListener("click", drawAlternativeRoutes);
  }

  // =======================
  // START APP
  // =======================

  initMap();
  addSkateparkMarkers();
  getUserLocation();
  connectButtons();

  window.addEventListener("online", loadTiles);
  window.addEventListener("offline", removeTiles);
});