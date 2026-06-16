const userPosts = document.getElementById("userPosts");

if (userPosts) {

  userPosts.addEventListener("click", async (e) => {

    const likeBtn = e.target.closest(".like-btn");
    const deleteBtn = e.target.closest(".delete-btn");

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

        await supabase
          .from("post_likes")
          .insert({
            user_id: user.id,
            post_id: postId
          });

        await loadPosts(userPosts);

      } catch (err) {

        console.error(
          "❌ Like error:",
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

  });

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
