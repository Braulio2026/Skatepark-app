import { supabase } from "./supabase.js";
import { loadPosts } from "./posts.js";

import { supabase } from "./supabase.js";

console.log("POSTS JS LOADED");
console.log("SUPABASE:", supabase);

const userPosts = document.getElementById("userPosts");

if (userPosts) {

  userPosts.addEventListener("click", async (e) => {

    const likeBtn = e.target.closest(".like-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (!likeBtn && !deleteBtn) return;

    const postId =
      likeBtn?.dataset.id ||
      deleteBtn?.dataset.id;

    console.log("POST ID:", postId);

    // =======================
    // LIKE
    // =======================

    if (likeBtn) {

      console.log("❤️ LIKE CLICKED");

      try {

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        console.log("USER:", user);

        if (userError) {
          console.error(userError);
          return;
        }

        if (!user) {
          alert("Login required");
          return;
        }

        const {
          data: existingLike,
          error: likeCheckError
        } = await supabase
          .from("post_likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("post_id", postId)
          .maybeSingle();

        console.log("EXISTING LIKE:", existingLike);

        if (likeCheckError) {
          console.error("LIKE CHECK ERROR:", likeCheckError);
          return;
        }

        if (existingLike) {
          alert("You already liked this post ❤️");
          return;
        }

        const { error: insertError } =
          await supabase
            .from("post_likes")
            .insert({
              user_id: user.id,
              post_id: postId
            });

        if (insertError) {
          console.error(
            "INSERT ERROR:",
            insertError
          );
          return;
        }

        console.log("✅ LIKE SAVED");

        await loadPosts(userPosts);

      } catch (err) {

        console.error(
          "❌ LIKE ERROR:",
          err
        );

      }

    }

  });

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

        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId)
          .eq("user_id", user.id);

        if (error) {
          console.error(error.message);
          return;
        }

        await loadPosts(userPosts);
        await loadEvents();

      } catch (err) {

        console.error(
          "❌ Delete error:",
          err
        );

      }
    }

supabase
  .channel("likes-channel")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "post_likes"
    },
    async () => {

      console.log(
        "❤️ Realtime likes update"
      );

      await loadPosts(userPosts);

    }
  )

  .subscribe((status) => {

    console.log(
      "📡 Realtime:",
      status
    );

  });
