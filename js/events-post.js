import { supabase } from "./supabase.js";

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
    const parsed = new URL(url, window.location.origin);
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

        <a href="${safeUrl(event.location)}"
           target="_blank"
           rel="noopener noreferrer">
           📍 View location
        </a>

        <div class="post-actions">

          <button class="like-btn" data-id="${event.id}">
            ❤️ ${event.likes ?? 0}
          </button>

          ${
            event.canDelete
              ? `<button class="delete-btn" data-id="${event.id}">
                   🗑️ Delete
                 </button>`
              : ""
          }

        </div>
      </div>
    </div>
  `;
}

// =======================
// RENDER POSTS
// =======================

function renderPosts(posts, container) {

  if (!container) return;

  container.innerHTML = "";

  posts.forEach(post => {
    container.insertAdjacentHTML(
      "beforeend",
      createPostCard(post)
    );
  });
}

// =======================
// LOAD POSTS
// =======================

export async function loadEvents(container) {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading posts:", error.message);
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
        likes: count ?? 0,
        canDelete: user?.id === post.user_id
      };
    })
  );

  renderPosts(postsWithLikes, container);
}

// =======================
// SAVE POST
// =======================

export async function savePost(post) {

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
    console.error("❌ Error saving post:", error.message);
    alert(error.message);
  }
}

// =======================
// IMAGE UPLOAD
// =======================

export async function uploadImage(file) {

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

  return data.publicUrl;
} 