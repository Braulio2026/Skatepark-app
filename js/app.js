import { loadPosts } from "./posts.js";
import { loadEvents } from "./events-post.js";
import { supabase } from "./supabase.js";

import { initEventsForm } from "./events-form.js";

document.addEventListener("DOMContentLoaded", async () => {

  console.log("✅ APP LOADED");

  // Initialize the publish form
  initEventsForm();

  // Load community posts
  const userPosts = document.getElementById("userPosts");

  if (userPosts) {
    await loadPosts(userPosts);
  }

  // Load events page list (does nothing if the page doesn't contain #events-list)
  await loadEvents();

  // File preview
  const imageInput = document.getElementById("image");
  const fileName = document.getElementById("file-name");

  imageInput?.addEventListener("change", () => {
    fileName.textContent =
      imageInput.files.length
        ? imageInput.files[0].name
        : "No file selected";
  });
});