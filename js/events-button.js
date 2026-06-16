 console.log("events-button.js loaded");
 
 import { loadEvents } from "./events-post.js";

// =======================
// INIT
// =======================

document.addEventListener("DOMContentLoaded", () => {

  loadEvents();
 
  const button = document.getElementById("events-btn");
  const panel = document.getElementById("events-panel");

  if (button && panel) {

    button.addEventListener("click", () => {

      console.log("button clicked");

      panel.classList.toggle("open");
    });

  }

});

// =======================
// TOGGLE EVENT CARDS
// =======================

document.addEventListener("click", (e) => {

  if (e.target.classList.contains("toggle-btn")) {

    const info = e.target.nextElementSibling;

    if (info) {
      info.classList.toggle("show");
    }

  }

}); 