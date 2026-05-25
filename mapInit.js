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
        selectedDestination = park;
        drawMainRoute();
      });
    });
  }

  // =======================
  // USER LOCATION
  // =======================

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = [
          position.coords.latitude,
          position.coords.longitude
        ];

        L.marker(userLocation)
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();

        map.setView(userLocation, 13);
      },
      () => {
        alert("Please enable location access.");
      }
    );
  }

  // =======================
  // ROUTES
  // =======================

  function clearRoutes() {
    routeLayers.forEach((layer) => map.removeLayer(layer));
    routeLayers = [];
  }

  function drawMainRoute() {
    if (!userLocation) {
      alert("Waiting for your location...");
      return;
    }

    if (!selectedDestination) {
      alert("Select a skatepark first.");
      return;
    }

    if (!navigator.onLine) {
      alert("You must be online to calculate routes.");
      return;
    }

    clearRoutes();

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${selectedDestination.lng},${selectedDestination.lat}` +
      `?overview=full&alternatives=false&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.length) {
          alert("Route not found.");
          return;
        }

        const route = data.routes[0];

        const layer = L.geoJSON(route.geometry, {
          style: {
            color: "blue",
            weight: 5
          }
        }).addTo(map);

        routeLayers.push(layer);
        map.fitBounds(layer.getBounds());
      })
      .catch((err) => {
        console.error("Routing error:", err);
      });
  }

  function drawAlternativeRoutes() {
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

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${selectedDestination.lng},${selectedDestination.lat}` +
      `?overview=full&alternatives=true&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.length) {
          alert("No routes found.");
          return;
        }

        data.routes.forEach((route, index) => {
          const layer = L.geoJSON(route.geometry, {
            style: {
              color: index === 0 ? "blue" : "green",
              weight: 5
            }
          }).addTo(map);

          routeLayers.push(layer);
        });
      })
      .catch((err) => {
        console.error("Routing error:", err);
      });
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

    L.popup()
      .setLatLng([nearest.lat, nearest.lng])
      .setContent(
        `🔥 Nearest Skatepark:<br><b>${nearest.name}</b><br>Distance: ${(minDistance / 1000).toFixed(2)} km`
      )
      .openOn(map);

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

// =======================
// ROUTING
// =======================

async function drawMainRoute() {
  if (!map || !userLocation || !selectedDestination) {
    console.warn("Map, user location, or destination missing");
    return;
  }

  // clear old routes
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];

  // =======================
  // OFFLINE FALLBACK
  // =======================
  if (!navigator.onLine) {
    const line = L.polyline(
      [
        userLocation,
        [selectedDestination.lat, selectedDestination.lng]
      ],
      {
        color: "blue",
        weight: 5
      }
    ).addTo(map);

    routeLayers.push(line);

    L.popup()
      .setLatLng([
        selectedDestination.lat,
        selectedDestination.lng
      ])
      .setContent(`
        🛹 <b>${selectedDestination.name}</b><br>
        📡 Offline mode<br>
        📏 Direct path (no roads)
      `)
      .openOn(map);

    return;
  }

  // =======================
  // ONLINE ROUTING
  // =======================
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};` +
      `${selectedDestination.lng},${selectedDestination.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes?.length) {
      console.warn("No route found");
      return;
    }

    const route = data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    const line = L.polyline(route, {
      weight: 5
    }).addTo(map);

    routeLayers.push(line);

    map.fitBounds(line.getBounds(), {
      padding: [30, 30]
    });

  } catch (error) {
    console.error("Routing error:", error);
  }
}