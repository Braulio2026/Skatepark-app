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
// TEST CONNECTION
// =======================
async function testConnection() {
  const { data, error } = await supabase
    .from("posts")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

testConnection();

// =======================
// AUTH SYSTEM
// =======================

const getInput = (id) =>
  document.getElementById(id).value.trim();

function validateAuth(email, password) {
  if (!email || !password) {
    alert("Complete all fields");
    return false;
  }
  return true;
}

async function handleAuth(type) {
  const email = getInput("email");
  const password = getInput("password");

  if (!validateAuth(email, password)) return;

  // Extra signup validation
  if (type === "signup" && password.length < 6) {
    alert("Password needs 6+ characters");
    return;
  }

  const action =
    type === "signup"
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({
          email,
          password
        });

  const { data, error } = await action;

  console.log(data);
  console.log(error);

  if (error) {
    const msg = error.message;

    if (msg.includes("rate limit")) {
      alert("Too many requests. Wait a minute.");
      return;
    }

    if (msg.includes("already registered")) {
      alert("User already registered. Try login.");
      return;
    }

    if (msg.includes("Email not confirmed")) {
      alert("📧 Confirm your email first");
      return;
    }

    alert(msg);
    return;
  }

  alert(
    type === "signup"
      ? "✅ Account created! Check your email to confirm."
      : "✅ Logged in!"
  );
}

// Buttons
signupBtn?.addEventListener("click", () =>
  handleAuth("signup")
);

loginBtn?.addEventListener("click", () =>
  handleAuth("login")
);

// =======================
// CHECK SESSION
// =======================

const $ = (id) => document.getElementById(id);

const userInfo = $("userInfo");
const authScreen = $("authScreen");
const mainApp = $("mainApp");

function updateUI(session) {
  if (!userInfo || !authScreen || !mainApp) return;

  const user = session?.user;

  if (user) {
    userInfo.textContent = `Logged as: ${user.email}`;
    authScreen.style.display = "none";
    mainApp.style.display = "block";
  } else {
    userInfo.textContent = "No user logged";
    authScreen.style.display = "flex";
    mainApp.style.display = "none";
  }
}

async function checkUser(session = null) {
  try {
    // Get session only if not passed
    if (!session) {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return updateUI(null);
      }

      session = data.session;
    }

    console.log("CURRENT SESSION:", session);
    updateUI(session);

  } catch (err) {
    console.error("Session error:", err);
    updateUI(null);
  }
}

// =======================
// INITIAL SESSION
// =======================
checkUser();

// =======================
// AUTH CHANGES
// =======================
const {
  data: { subscription }
} = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log("AUTH EVENT:", event);
    updateUI(session);
  }
);

// Optional cleanup
  window.addEventListener("beforeunload", () => {
  subscription?.unsubscribe();
});

// =======================
// HELPERS
// =======================

function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(url = "") {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.href
      : "#";
  } catch {
    return "#";
  }
}

// =======================
// CREATE POST CARD
// =======================

  function createPostCard(event) {

    return `
      <div class="post-card" id="post-${event.id}">

        <img src="${event.imageUrl}" alt="Post image">

        <div class="post-content">

          <h4>${escapeHTML(event.title)}</h4>

          <p>
            ${escapeHTML(event.description)}
            <br><br>
            📅 ${event.date}
          </p>

          <a href="${safeUrl(event.location)}" target="_blank" rel="noopener noreferrer">
            📍 View location
          </a>

          <div class="post-actions">

            <button class="like-btn" data-id="${event.id}">
              ❤️ ${event.likes ?? 0}
            </button>

            ${event.canDelete ? `
            <button class="delete-btn" data-id="${event.id}">
             🗑️ Delete
            </button>
           ` : ""}

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

  // GET CURRENT USER
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // LOAD POSTS
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

  // FORMAT POSTS
  const formattedPosts = data.map(post => ({
    ...post,
    imageUrl: post.image_url,
    canDelete: user?.id === post.user_id
  }));

  renderPosts(formattedPosts);
}

  // =======================
  // SAVE POST
  // =======================

async function savePost(post) {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Login required");
    return;
  }

  const { error } = await supabase
    .from('posts')
    .insert([
      {
        title: post.title,
        description: post.description,
        date: post.date,
        location: post.location,
        image_url: post.imageUrl,
        likes: 0,
        user_id: user.id
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
    eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = imageInput.files[0];
    let imageUrl = "image-skates/spot_1.jpeg";

    if (imageFile) {

      // 1. SIZE VALIDATION
      if (imageFile.size > 3 * 1024 * 1024) {
        alert("Max 3MB");
        return;
      }

      // 2. TYPE VALIDATION
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowed.includes(imageFile.type)) {
        alert("Only JPG, PNG, WEBP");
        return;
      }

      // 3. UPLOAD ONLY AFTER VALIDATION
      const uploadedUrl = await uploadImage(imageFile);

      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const newEvent = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      date: document.getElementById("date").value,
      location: document.getElementById("location").value.trim(),
      imageUrl: imageUrl
    };

    // 4. REQUIRED FIELDS CHECK
    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.date ||
      !newEvent.location
    ) {
      alert("All fields required");
      return;
    }

    console.log("NEW EVENT:", newEvent);

    await savePost(newEvent);
    await loadPosts();

    eventForm.reset();

    document.getElementById("file-name").textContent =
      "No file selected";
  });
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

           const {
            data: { user }
            } = await supabase.auth.getUser();

          if (!user) {
            alert("Login required");
            return;
          }

         const { error } =
                await supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

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