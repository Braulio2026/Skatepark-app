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
  const { data, error } = await supabase.from("posts").select("*");
  console.log("DATA:", data, "ERROR:", error);
}

testConnection();


// =======================
// AUTH SYSTEM
// =======================

const getInput = id => document.getElementById(id).value.trim();

function validateAuth(email, password) {
  if (!email || !password) return alert("Complete all fields"), false;
  return true;
}

async function handleAuth(type) {

  const email = getInput("email");
  const password = getInput("password");

  if (!validateAuth(email, password)) return;

  if (type === "signup" && password.length < 6)
    return alert("Password needs 6+ characters");

  const { data, error } =
    await (type === "signup"
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password }));

  console.log(data, error);

  if (error) {

    if (error.message.includes("rate limit"))
      return alert("Too many requests. Wait a minute.");

    if (error.message.includes("already registered"))
      return alert("User already registered. Try login.");

    if (error.message.includes("Email not confirmed"))
      return alert("📧 Confirm your email first");

    return alert(error.message);
  }

  alert(type === "signup"
    ? "✅ Account created! Check your email to confirm."
    : "✅ Logged in!");
}

signupBtn?.addEventListener("click", () => handleAuth("signup"));
loginBtn?.addEventListener("click", () => handleAuth("login"));


// =======================
// CHECK SESSION
// =======================

const $ = id => document.getElementById(id);

const userInfo = $("userInfo"),
      authScreen = $("authScreen"),
      mainApp = $("mainApp");

function updateUI(session) {

  if (!userInfo || !authScreen || !mainApp) return;

  const user = session?.user;

  userInfo.textContent = user
    ? `Logged as: ${user.email}`
    : "No user logged";

  authScreen.style.display = user ? "none" : "flex";
  mainApp.style.display = user ? "block" : "none";
}

async function checkUser(session = null) {

  try {

    if (!session) {

      const { data, error } =
        await supabase.auth.getSession();

      if (error) return updateUI(null);

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
} = supabase.auth.onAuthStateChange((event, session) => {

  console.log("AUTH EVENT:", event);
  updateUI(session);

});

window.addEventListener(
  "beforeunload",
  () => subscription?.unsubscribe()
);

// =======================
// HELPERS
// =======================

function escapeHTML(str = "") {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

function safeUrl(url = "") {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.href : "#";
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

        <a href="${safeUrl(event.location)}"
           target="_blank"
           rel="noopener noreferrer">
           📍 View location
        </a>

        <div class="post-actions">

          <button class="like-btn" data-id="${event.id}">
            ❤️ ${event.likes ?? 0}
          </button>

          ${event.canDelete
            ? `<button class="delete-btn" data-id="${event.id}">
                 🗑️ Delete
               </button>`
            : ""}

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

  posts.forEach(post =>
    userPosts.insertAdjacentHTML(
      "beforeend",
      createPostCard(post)
    )
  );
}


// =======================
// LOAD POSTS
// =======================

async function loadPosts() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "❌ Error loading posts:",
      error.message
    );
    return;
  }

  const postsWithLikes = await Promise.all(
    data.map(async post => {

      const { count } = await supabase
        .from("post_likes")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("post_id", post.id);

      return {
        ...post,
        imageUrl: post.image_url,
        likes: count || 0,
        canDelete: user?.id === post.user_id
      };
    })
  );

  renderPosts(postsWithLikes);

  document.querySelectorAll(".toggle-btn")
    .forEach(btn =>
      btn.addEventListener("click", () =>
        btn.nextElementSibling.classList.toggle("show")
      )
    );
}


/* LOAD POST TO FLOATING EVENTS-BUTTON */

async function loadEvents() {

  const container =
    document.getElementById("events-list");

  if (!container) return;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "❌ Error loading events:",
      error.message
    );
    return;
  }

  container.innerHTML = "";

  data.forEach(event => {

    const div = document.createElement("div");

    div.classList.add("event-item");

    div.innerHTML = `
      <div class="event-card">

        <button class="toggle-btn">
          ${event.title}
        </button>

        <div class="event-info">

          <p>
            <strong>Date:</strong>
            ${event.date}
          </p>

          <p>
            <strong>Location:</strong>
            ${event.location}
          </p>

          <p>${event.description}</p>

        </div>

      </div>
    `;

    container.appendChild(div);
  });

  document.querySelectorAll(".toggle-btn")
    .forEach(btn =>
      btn.addEventListener("click", () =>
        btn.nextElementSibling.classList.toggle("show")
      )
    );
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
    .from("posts")
    .insert([{
      title: post.title,
      description: post.description,
      date: post.date,
      location: post.location,
      image_url: post.imageUrl,
      user_id: user.id
    }]);

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

  const { error } = await supabase.storage
    .from("events-images")
    .upload(fileName, file);

  if (error) {
    console.error(
      "❌ Upload error:",
      error.message
    );
    return null;
  }

  const { data } = supabase.storage
    .from("events-images")
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

        // 1. SIZE VALIDATION
        if (
          imageFile.size >
          3 * 1024 * 1024
        ) {
          alert("Max 3MB");
          return;
        }

        // 2. TYPE VALIDATION
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];

        if (
          !allowed.includes(
            imageFile.type
          )
        ) {
          alert(
            "Only JPG, PNG, WEBP"
          );
          return;
        }

        // 3. UPLOAD ONLY AFTER VALIDATION
        const uploadedUrl =
          await uploadImage(imageFile);

        if (uploadedUrl)
          imageUrl = uploadedUrl;
      }

      const newEvent = {
        title:
          document.getElementById("title")
            .value.trim(),

        description:
          document.getElementById("description")
            .value.trim(),

        date:
          document.getElementById("date")
            .value,

        location:
          document.getElementById("location")
            .value.trim(),

        imageUrl
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

      console.log(
        "NEW EVENT:",
        newEvent
      );

      await savePost(newEvent);
      await loadPosts();
      await loadEvents();

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
        document.getElementById(
          "file-name"
        );

      if (!fileNameDisplay) return;

      fileNameDisplay.textContent =
        imageInput.files.length > 0
          ? imageInput.files[0].name
          : "No file selected";
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

      // SAFER BUTTON DETECTION
      const likeBtn =
        e.target.closest(".like-btn");

      const deleteBtn =
        e.target.closest(".delete-btn");

      const postId =
        likeBtn?.dataset.id ||
        deleteBtn?.dataset.id;

      if (!postId) return;

      // =======================
      // LIKE
      // =======================

      if (likeBtn) {

        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

          alert("Login required");
          return;
        }

        try {

          console.log("AUTH USER:", user);
          console.log("USER ID:", user.id);
          console.log("POST ID:", postId);

          // CHECK IF USER ALREADY LIKED
          const {
            data: existingLike,
            error: likeCheckError
          } = await supabase
            .from("post_likes")
            .select("id")
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .maybeSingle();

          if (likeCheckError) {

            console.error(
              "❌ Like check error:",
              likeCheckError.message
            );

            return;
          }

          // PREVENT DOUBLE LIKE
          if (existingLike) {

            alert(
              "You already liked this post ❤️"
            );

            return;
          }

          // INSERT LIKE RECORD
          const likePayload = {
            user_id: user.id,
            post_id: postId
          };

          console.log(
            "INSERTING LIKE:",
            likePayload
          );

          const {
            error: insertError
          } = await supabase
            .from("post_likes")
            .insert(likePayload);

          if (insertError) {

            console.error(
              "❌ Insert like error:",
              insertError.message
            );

            return;
          }

          // RELOAD POSTS
         await loadPosts();

          console.log(
            "❤️ Like added:",
            postId
          );

        } catch (err) {

          console.error(
            "❌ Unexpected like error:",
            err
          );
        }
      }

      // =======================
      // DELETE
      // =======================

      if (deleteBtn) {

        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

          alert("Login required");
          return;
        }

        try {

      // DELETE POST
          const {
            error
          } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId)
            .eq("user_id", user.id);

          if (error) {

            console.error(
              "❌ Delete error:",
              error.message
            );

            return;
          }

      // DELETE RELATED LIKES
          console.log(
            "🗑️ Post deleted:",
            postId
          );

          await loadPosts();
          await loadEvents();

        } catch (err) {

          console.error(
            "❌ Unexpected delete error:",
            err
          );
        }
      }
    }
  );
}

  // =======================
  // REALTIME POSTS
  // =======================

     supabase
  .channel('likes-channel')

  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'post_likes'
    },
    async () => {

      console.log(
        "❤️ Realtime likes update"
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
  loadEvents(); 
});