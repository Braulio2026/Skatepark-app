import { supabase } from './js/supabase.js';

document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ APP LOADED");

  // =======================
  // AUTH ELEMENTS
  // =======================

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // =======================
  // POSTS ELEMENTS
  // =======================

  const eventForm = document.getElementById("eventForm");
  const userPosts = document.getElementById("userPosts");
  const imageInput = document.getElementById("image");

  // =======================
  // MAP
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

      if (!tileLayer) return;

      map.removeLayer(tileLayer);
      tileLayer = null;
    }

    if (navigator.onLine) {
      loadTiles();
    }

    window.addEventListener("online", loadTiles);
    window.addEventListener("offline", removeTiles);
  }

  // =======================
  // TEST CONNECTION
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
  // AUTH SYSTEM
  // =======================

  if (signupBtn) {

    signupBtn.addEventListener("click", async () => {

      const email =
        document.getElementById("email").value;

      const password =
        document.getElementById("password").value;

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password
        });

      console.log(data);
      console.log(error);

      if (error) {

        alert(error.message);

      } else {

        alert("✅ User created!");
      }
    });
  }

  if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

      const email =
        document.getElementById("email").value;

      const password =
        document.getElementById("password").value;

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      console.log(data);
      console.log(error);

      if (error) {

        alert(error.message);

      } else {

        alert("✅ Logged in!");
      }
    });
  }

  if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

      await supabase.auth.signOut();

      alert("👋 Logged out");
    });
  }

  // =======================
  // CHECK SESSION
  // =======================

  async function checkUser() {

    const {
      data: { session }
    } = await supabase.auth.getSession();

    console.log("CURRENT SESSION:", session);

    const userInfo =
      document.getElementById("userInfo");

    if (!userInfo) return;

    if (session?.user) {

      userInfo.textContent =
        `Logged as: ${session.user.email}`;

    } else {

      userInfo.textContent =
        "No user logged";
    }
  }

  checkUser();

  supabase.auth.onAuthStateChange(
    (event, session) => {

      console.log("AUTH EVENT:", event);

      checkUser();
    }
  );

  // =======================
  // CREATE POST CARD
  // =======================

  function createPostCard(event) {

    return `
      <div class="post-card" id="post-${event.id}">

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
              ❤️ ${event.likes ?? 0}
            </button>

            <button class="delete-btn" data-id="${event.id}">
              🗑️ Delete
            </button>

          </div>

        </div>

      </div>
    `;
  }

  // =======================
  // RENDER POSTS
  // =======================

  function renderPosts(posts) {

    if (!userPosts) return;

    userPosts.innerHTML = "";

    posts.forEach(post => {

      userPosts.insertAdjacentHTML(
        "beforeend",
        createPostCard(post)
      );
    });
  }

  // =======================
  // LOAD POSTS
  // =======================

  async function loadPosts() {

    const { data, error } =
      await supabase
        .from('posts')
        .select('*')
        .order('created_at', {
          ascending: false
        });

    if (error) {

      console.error(
        "❌ Error loading posts:",
        error.message
      );

      return;
    }

    const formattedPosts = data.map(post => ({
      ...post,
      imageUrl: post.image_url
    }));

    renderPosts(formattedPosts);
  }

  // =======================
  // SAVE POST
  // =======================

  async function savePost(post) {

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title: post.title,
          description: post.description,
          date: post.date,
          location: post.location,
          image_url: post.imageUrl,
          likes: 0
        }
      ]);

    if (error) {

      console.error(
        "❌ Error saving post:",
        error.message
      );

      alert(error.message);
    }
  }

  // =======================
  // IMAGE UPLOAD
  // =======================

  async function uploadImage(file) {

    const fileName =
      Date.now() + "-" + file.name;

    const { error } =
      await supabase.storage
        .from('events-images')
        .upload(fileName, file);

    if (error) {

      console.error(
        "❌ Upload error:",
        error.message
      );

      return null;
    }

    const { data } =
      supabase.storage
        .from('events-images')
        .getPublicUrl(fileName);

    console.log(
      "✅ Image URL:",
      data.publicUrl
    );

    return data.publicUrl;
  }

  // =======================
  // FORM SUBMIT
  // =======================

  if (eventForm) {

    eventForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const imageFile =
          imageInput.files[0];

        let imageUrl =
          "image-skates/spot_1.jpeg";

        if (imageFile) {

          const uploadedUrl =
            await uploadImage(imageFile);

          if (uploadedUrl) {

            imageUrl = uploadedUrl;
          }
        }

        const newEvent = {

          title:
            document.getElementById("title").value,

          description:
            document.getElementById("description").value,

          date:
            document.getElementById("date").value,

          location:
            document.getElementById("location").value,

          imageUrl: imageUrl
        };

        console.log(
          "NEW EVENT:",
          newEvent
        );

        await savePost(newEvent);

        await loadPosts();

        eventForm.reset();

        document.getElementById(
          "file-name"
        ).textContent =
          "No file selected";
      }
    );
  }

  // =======================
  // FILE NAME
  // =======================

  if (imageInput) {

    imageInput.addEventListener(
      "change",
      () => {

        const fileNameDisplay =
          document.getElementById("file-name");

        if (!fileNameDisplay) return;

        if (imageInput.files.length > 0) {

          fileNameDisplay.textContent =
            imageInput.files[0].name;

        } else {

          fileNameDisplay.textContent =
            "No file selected";
        }
      }
    );
  }

  // =======================
  // LIKE + DELETE
  // =======================

  if (userPosts) {

    userPosts.addEventListener(
      "click",
      async (e) => {

        const postId =
          e.target.dataset.id;

        if (!postId) return;

        // =======================
        // LIKE
        // =======================

        if (
          e.target.classList.contains(
            "like-btn"
          )
        ) {

          let likedPosts =
            JSON.parse(
              localStorage.getItem(
                "likedPosts"
              )
            ) || [];

          console.log("LIKED POSTS:", likedPosts);
          console.log("POST ID:", postId);


          if (
            likedPosts.includes(String(postId))
          ) {

            alert(
              "You already liked this post ❤️"
            );

            return;
          }

          const { data, error } =
            await supabase
              .from('posts')
              .select('likes')
              .eq('id', postId)
              .single();

          if (error) {

            console.error(error);
            return;
          }

          const currentLikes =
            data.likes || 0;

          const {
            error: updateError
          } = await supabase
            .from('posts')
            .update({
              likes:
                currentLikes + 1
            })
            .eq('id', postId);

          if (updateError) {

            console.error(
              updateError
            );

            return;
          }

       console.log("LIKES UPDATED:", currentLikes + 1);

      // UPDATE BUTTON UI INSTANTLY
       e.target.innerHTML =
        `❤️ ${currentLikes + 1}`;

      // SAVE LOCAL LIKE
        likedPosts.push(String(postId));

       localStorage.setItem(
        "likedPosts",
         JSON.stringify(likedPosts)
       );
      }

        // =======================
        // DELETE
        // =======================

        if (
          e.target.classList.contains(
            "delete-btn"
          )
        ) {

          const { error } =
            await supabase
              .from('posts')
              .delete()
              .eq('id', postId);

          if (error) {

            console.error(
              "❌ Delete error:",
              error.message
            );

          } else {

            await loadPosts();
          }
        }
      }
    );
  }

  // =======================
  // REALTIME POSTS
  // =======================

  supabase
    .channel('posts-channel')

    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts'
      },
      async (payload) => {

        console.log(
          "🔄 Realtime change:",
          payload
        );

        await loadPosts();
      }
    )

    .subscribe((status) => {

      console.log(
        "📡 Realtime:",
        status
      );
    });

  // =======================
  // INIT
  // =======================

  loadPosts();

});