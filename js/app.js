import {
  loadPosts
} from './posts.js';

document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ APP LOADED");

  const userPosts = document.getElementById("userPosts");

  loadPosts(userPosts);

});