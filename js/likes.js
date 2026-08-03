import { supabase } from "./supabase.js";
import { loadPosts } from "./posts.js";
import { loadEvents } from "./events-post.js";

console.log("LIKES JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const userPosts = document.getElementById("userPosts");

    if (!userPosts) return;

    userPosts.addEventListener("click", async (e) => {

        const likeBtn = e.target.closest(".like-btn");
        const deleteBtn = e.target.closest(".delete-btn");

        if (!likeBtn && !deleteBtn) return;

        const postId =
            likeBtn?.dataset.id ||
            deleteBtn?.dataset.id;

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Login required");
            return;
        }

        // ======================
        // LIKE
        // ======================

        if (likeBtn) {

            const { data: existingLike } =
                await supabase
                    .from("post_likes")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("post_id", postId)
                    .maybeSingle();

            if (existingLike) {
                alert("You already liked this post ❤️");
                return;
            }

            const { error } =
                await supabase
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
            return;
        }

        // ======================
        // DELETE
        // ======================

        if (deleteBtn) {

            const { error } =
                await supabase
                    .from("posts")
                    .delete()
                    .eq("id", postId)
                    .eq("user_id", user.id);

            if (error) {
                console.error(error);
                return;
            }

            await loadPosts(userPosts);
            await loadEvents();
        }

    });

    // ======================
    // REALTIME
    // ======================

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
                await loadPosts(userPosts);
            }
        )
        .subscribe();

});