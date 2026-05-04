// =======================
// MAP INITIALIZATION
// =======================

import { supabase } from './js/supabase.js'

async function testConnection() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')

  console.log("DATA:", data)
  console.log("ERROR:", error)
}

testConnection();

// const map = L.map('map').setView([9.93, -84.08], 13);

// map.setMaxBounds([
//   [9.85, -84.25],
//   [10.05, -83.90]
// ]);

// =======================
// TILE LAYER (SMART LOAD)
// =======================

let tileLayer = null;

function loadTiles() {
  if (tileLayer) return;

  tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

function removeTiles() {
  if (tileLayer) {
    map.removeLayer(tileLayer);
    tileLayer = null;
  }
}

// Initial load
if (navigator.onLine) loadTiles();

// React to connection changes
window.addEventListener("online", loadTiles);
window.addEventListener("offline", removeTiles);

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
    name: "Turba Alajuelita Skatepark",
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
// VISITED STORAGE
// =======================

function getVisited() {
  return JSON.parse(localStorage.getItem("visited")) || [];
}

function saveVisited(park) {
  const visited = getVisited();

  if (!visited.find(p => p.name === park.name)) {
    visited.push(park);
    localStorage.setItem("visited", JSON.stringify(visited));
  }
}

// =======================
// ADD SKATEPARK MARKERS
// =======================

const visitedList = getVisited();

skateparks.forEach(park => {

  const isVisited = visitedList.find(p => p.name === park.name);

  const marker = L.marker([park.lat, park.lng], {
    opacity: isVisited ? 0.5 : 1
  })
    .addTo(map)
    .bindPopup(`<b>${park.name}</b><br>${park.description}`);

  marker.on("click", () => {
    selectedDestination = park;
    saveVisited(park);
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
  console.log("Location not available");
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
    const distance = map.distance(userLocation, [park.lat, park.lng]);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = park;
    }
  });

  selectedDestination = nearest;

  L.popup()
    .setLatLng([nearest.lat, nearest.lng])
    .setContent(`🔥 <b>${nearest.name}</b><br>${(minDistance/1000).toFixed(2)} km`)
    .openOn(map);

  drawMainRoute();
}

// =======================
// DRAW MAIN ROUTE
// =======================

function drawMainRoute() {

  if (!selectedDestination) {
    alert("Select a skatepark first.");
    return;
  }

  clearRoutes();

  // OFFLINE
  if (!navigator.onLine) {

    if (!userLocation) {
      alert("Location not available offline.");
      return;
    }

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
        📏 Direct path
      `)
      .openOn(map);

    return;
  }

  // ONLINE ROUTING
  const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination.lng},${selectedDestination.lat}?overview=full&alternatives=false&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      if (!data.routes?.length) {
        alert("Route not found.");
        return;
      }

      const route = data.routes[0];

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
          ⏱️ Time: ~${durationMin} min
        `)
        .openOn(map);
    })
    .catch(err => console.error("Routing error:", err));
}

// =======================
// DRAW ALTERNATIVE ROUTES
// =======================

function drawAlternativeRoutes() {

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

  const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination.lng},${selectedDestination.lat}?overview=full&alternatives=true&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      console.log("ROUTES DATA:", data); // 🔍 DEBUG (you can remove later)

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
            weight: 5,
            opacity: 0.7,
            dashArray: index === 0 ? null : "6,6"
          }
        }).addTo(map);

        routeLayers.push(layer);

        // CLICK TO HIGHLIGHT ROUTE
        layer.on("click", () => {

          routeLayers.forEach(r => {
            r.setStyle({
              weight: 5,
              opacity: 0.5
            });
          });

          layer.setStyle({
            weight: 8,
            opacity: 1
          });

          L.popup()
            .setLatLng([selectedDestination.lat, selectedDestination.lng])
            .setContent(`
              🛹 <b>${selectedDestination.name}</b><br>
              📏 Distance: ${distanceKm} km<br>
              ⏱️ Time: ~${durationMin} min<br>
              ⭐ Selected route
            `)
            .openOn(map);
        });

        // 📍 Popup for main route
        if (index === 0) {
          L.popup()
            .setLatLng([selectedDestination.lat, selectedDestination.lng])
            .setContent(`
              🛹 <b>${selectedDestination.name}</b><br>
              📏 Distance: ${distanceKm} km<br>
              ⏱️ Time: ~${durationMin} min<br>
              🟢 + alternative routes available
            `)
            .openOn(map);
        }

      });

    })
    .catch(err => {
      console.error("Routing error:", err);
    });
}

// =======================
// BUTTONS
// =======================

document.getElementById("btn-1")
  .addEventListener("click", findNearestSkatepark);

document.getElementById("btn-2")
  .addEventListener("click", drawAlternativeRoutes);

// =======================
// ONLINE / OFFLINE UI
// =======================

window.addEventListener("offline", () => {
  console.log("📡 Offline mode");
  document.getElementById("map").style.opacity = "0.6";
});

window.addEventListener("online", () => {
  console.log("🌐 Back online");
  document.getElementById("map").style.opacity = "1";
});

// =======================
// EVENTS SYSTEM
// =======================

document.addEventListener("DOMContentLoaded", () => {

  const eventForm = document.getElementById("eventForm");
  const userPosts = document.getElementById("userPosts");
  const imageInput = document.getElementById("image");

  if (!eventForm || !userPosts) return;

  // ---------- CONVERT IMAGE ----------
  function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // ---------- CREATE POST CARD ----------
  function createPostCard(event) {
    return `
      <div class="post-card">
        <img src="${event.imageUrl}" alt="Post image">

        <div class="post-content">
          <h4>${event.title}</h4>
          <p>
            ${event.description}
            <br><br>
            📅 ${event.date}
          </p>

          <a href="${event.location || '#'}" target="_blank">
            📍 View location
          </a>

          <div class="post-actions">
            <button class="like-btn" data-id="${event.id}">
              ❤️ ${event.likes || 0}
            </button>

            <button class="delete-btn" data-id="${event.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- RENDER POSTS ----------
  function renderPosts(posts) {
    userPosts.innerHTML = "";

    posts.forEach(post => {
      userPosts.insertAdjacentHTML("beforeend", createPostCard(post));
    });
  }

  // ---------- SAVE ----------
  async function savePost(post) {
    const { error } = await supabase
      .from('posts')
      .insert([{
        title: post.title,
        description: post.description,
        date: post.date,
        location: post.location,
        image_url: post.imageUrl,
        likes: 0
      }]);

    if (error) {
      console.error("Error saving post:", error);
    }
  }

  // ---------- LOAD ----------
  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      return;
    }

    const formattedPosts = data.map(post => ({
      ...post,
      imageUrl: post.image_url
    }));

    renderPosts(formattedPosts);
  }

  // ---------- DELETE ----------
  userPosts.addEventListener("click", async (e) => {
    const postId = e.target.dataset.id;
    if (!postId) return;

    if (e.target.classList.contains("delete-btn")) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error("Delete error:", error);
      } else {
        await loadPosts();
      }
    }
  });

  // ---------- FORM ----------
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = imageInput.files[0];

    let imageUrl = "image-skates/spot_1.jpeg";

    if (imageFile) {
      imageUrl = await convertImageToBase64(imageFile);
    }

    const newEvent = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      date: document.getElementById("date").value,
      location: document.getElementById("location").value,
      imageUrl: imageUrl
    };

    await savePost(newEvent);
    await loadPosts();

    eventForm.reset();
    document.getElementById("file-name").textContent = "No file selected";
  });

  // ---------- FILE NAME ----------
  imageInput.addEventListener("change", () => {
    const fileNameDisplay = document.getElementById("file-name");

    if (imageInput.files.length > 0) {
      fileNameDisplay.textContent = imageInput.files[0].name;
    } else {
      fileNameDisplay.textContent = "No file selected";
    }
  });

  // ---------- INIT ----------
  loadPosts();

});
