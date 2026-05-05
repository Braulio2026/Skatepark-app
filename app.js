import { supabase } from './js/supabase.js';

document.addEventListener("DOMContentLoaded", () => {

// =======================
  // REALTIME POSTS
// =======================

supabase
  .channel('posts-channel')
  .on(
    'postgres_changes',
    {
      event: '*', // listen to INSERT, DELETE, UPDATE
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log("🔄 Change detected:", payload);

      // Reload posts automatically
      loadPosts();
    }
  )
  .subscribe();

  // =======================
  // MAP INITIALIZATION
  // =======================

  const mapElement = document.getElementById("map");
  let map = null;
  let tileLayer = null;

  if (mapElement && typeof L !== "undefined") {

    map = L.map('map').setView([9.93, -84.08], 13);

    map.setMaxBounds([
      [9.85, -84.25],
      [10.05, -83.90]
    ]);

    function loadTiles() {
      if (tileLayer) return;

      tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }
      ).addTo(map);
    }

    function removeTiles() {
      if (tileLayer) {
        map.removeLayer(tileLayer);
        tileLayer = null;
      }
    }

    if (navigator.onLine) loadTiles();

    window.addEventListener("online", loadTiles);
    window.addEventListener("offline", removeTiles);
  }

  // =======================
  // TEST SUPABASE
  // =======================

  async function testConnection() {
    const { data, error } = await supabase
      .from('posts')
      .select('*');

    console.log("DATA:", data);
    console.log("ERROR:", error);
  }

  testConnection();

  // =======================
  // EVENTS SYSTEM
  // =======================

  const eventForm = document.getElementById("eventForm");
  const userPosts = document.getElementById("userPosts");
  const imageInput = document.getElementById("image");

  if (!eventForm || !userPosts) return;

  // ---------- CREATE CARD ----------
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
            <button class="delete-btn" data-id="${event.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- RENDER ----------
  function renderPosts(posts) {
    userPosts.innerHTML = "";

    posts.forEach(post => {
      userPosts.insertAdjacentHTML("beforeend", createPostCard(post));
    });
  }

  // ---------- UPLOAD IMAGE ----------
  async function uploadImage(file) {
    const fileName = Date.now() + "-" + file.name;

    const { error } = await supabase.storage
      .from('events-images')
      .upload(fileName, file);

    if (error) {
      console.error("❌ Upload error:", error.message);
      alert("Image upload failed");
      return null;
    }

    const { data } = supabase.storage
      .from('events-images')
      .getPublicUrl(fileName);

    console.log("✅ Image URL:", data.publicUrl);

    return data.publicUrl;
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
      console.error("❌ Error saving post:", error.message);
    }
  }

  // ---------- LOAD ----------
  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error loading posts:", error.message);
      return;
    }

    const formatted = data.map(post => ({
      ...post,
      imageUrl: post.image_url
    }));

    renderPosts(formatted);
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
        console.error("❌ Delete error:", error.message);
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
      const uploadedUrl = await uploadImage(imageFile);

      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const newEvent = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      date: document.getElementById("date").value,
      location: document.getElementById("location").value,
      imageUrl: imageUrl
    };

    console.log("NEW EVENT:", newEvent);

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