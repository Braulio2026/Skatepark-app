// =====================
// Realtime Posts
// =====================

supabase
  .channel("posts-channel")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "posts"
    },
    async () => {

      const userPosts = document.getElementById("userPosts");

      if (userPosts)
        await loadPosts(userPosts);

      await loadEvents();

    }
  )
  .subscribe();

// =====================
// Realtime Likes
// =====================

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

      const userPosts = document.getElementById("userPosts");

      if (userPosts)
        await loadPosts(userPosts);

    }
  )
  .subscribe();