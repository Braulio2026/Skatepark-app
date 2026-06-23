import {uploadImage,
        savePost,
        loadPosts,
      } from "./posts.js";
import { loadEvents } from './events-post.js';
import { supabase } from './supabase.js';

document.addEventListener("DOMContentLoaded", async () => {

  console.log("✅ APP LOADED");
  
  const form = document.getElementById("eventForm");

form?.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const title =
            document.getElementById("title").value;

        const date =
            document.getElementById("date").value;

        const location =
            document.getElementById("location").value;

        const description =
            document.getElementById("description").value;

        const imageFile =
            document.getElementById("image").files[0];

        let imageUrl = "";

        if (imageFile) {

            imageUrl = await uploadImage(imageFile);

        }

        await savePost({

            title,
            date,
            location,
            description,
            imageUrl

        });

        form.reset();

        document.getElementById("file-name").textContent =
            "No file selected";

    } catch (err) {

        console.error(err);

    }

});

  const userPosts =
    document.getElementById("userPosts");

  if (userPosts) {
    await loadPosts(userPosts);
  }

  // =======================
  // FILE NAME PREVIEW
  // =======================

  const imageInput =
    document.getElementById("image");

  const fileName =
    document.getElementById("file-name");

  imageInput?.addEventListener(
    "change",
    () => {

      fileName.textContent =
        imageInput.files.length
          ? imageInput.files[0].name
          : "No file selected";

    }
  );

});

const userPosts = document.getElementById("userPosts");

console.log("USER POSTS:", userPosts);

if (userPosts) {

  userPosts.addEventListener("click", async (e) => {

    const likeBtn =
      e.target.closest(".like-btn");

    const deleteBtn =
      e.target.closest(".delete-btn");

    const postId =
      likeBtn?.dataset.id ||
      deleteBtn?.dataset.id;

    if (!postId) return;

    // =====================
    // LIKE
    // =====================

    if (likeBtn) {

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Login required");
        return;
      }

      const {
        data: existingLike
      } = await supabase
        .from("post_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (existingLike) {
        alert("You already liked this post ❤️");
        return;
      }

      const { error } = await supabase
        .from("post_likes")
        .insert({
          user_id: user.id,
          post_id: postId
        });

      if (error) {
        console.error(error);
        return;
      }

      await loadPosts(userPosts);
    }

    // =====================
    // DELETE
    // =====================
    
  if (deleteBtn) {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Login required");
    return;
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

}

});

}

// =======================
// REALTIME POSTS
// =======================

const postsChannel = supabase
  .channel("posts-channel")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "posts"
    },
    async (payload) => {

      console.log("📢 Posts updated:", payload.eventType);

      const userPosts =
        document.getElementById("userPosts");

      if (userPosts) {
        await loadPosts(userPosts);
      }

      if (typeof loadEvents === "function") {
        await loadEvents();
      }

    }
  )

  .subscribe(status => {
    console.log("📡 Posts realtime:", status);
  });

  // =======================
// REALTIME LIKES
// =======================

const likesChannel = supabase
  .channel("likes-channel")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "post_likes"
    },
    async () => {

      const userPosts =
        document.getElementById("userPosts");

      if (userPosts) {
        await loadPosts(userPosts);
      }

    }
  )

  .subscribe(status => {
    console.log("❤️ Likes realtime:", status);
  });