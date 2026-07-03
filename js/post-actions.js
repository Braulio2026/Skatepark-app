 // =====================
  // LIKE / DELETE
  // =====================

  userPosts?.addEventListener("click", async (e) => {

    const likeBtn = e.target.closest(".like-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    const postId =
      likeBtn?.dataset.id ||
      deleteBtn?.dataset.id;

    if (!postId) return;

    // LIKE
    if (likeBtn) {

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Login required");
        return;
      }

      const { data: existingLike } = await supabase
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

      if (!error) {
        await loadPosts(userPosts);
      }

      return;
    }

    // DELETE
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

      if (!error) {
        await loadPosts(userPosts);
        await loadEvents();
      }
    }

  });
