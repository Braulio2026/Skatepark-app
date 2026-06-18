import { loadEvents }
from "./events-post.js";

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadEvents();

    const button =
      document.getElementById("events-btn");

    const panel =
      document.getElementById("events-panel");

    if (button && panel) {

      button.addEventListener(
        "click",
        () => {

          panel.classList.toggle("open");

        }
      );

    }

  }
);

document.addEventListener(
  "click",
  e => {

    if (
      e.target.classList.contains(
        "toggle-btn"
      )
    ) {

      const info =
        e.target.nextElementSibling;

      info?.classList.toggle(
        "show"
      );

    }

  }
);