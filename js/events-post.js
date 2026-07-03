import { supabase } from "./supabase.js";

export async function loadEvents() {

  const container =
    document.getElementById("events-list");

  if (!container) return;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(
      "❌ Error loading events:",
      error.message
    );

    return;
  }

  container.innerHTML = "";

  data.forEach(event => {

    const div =
      document.createElement("div");

    div.classList.add("event-item");

    div.innerHTML = `
      <div class="event-card">

        <button class="toggle-btn">
          ${event.title}
        </button>

        <div class="event-info">

          <p>
            <strong>Date:</strong>
            ${event.date}
          </p>

          <p>
            <strong>Location:</strong>
            ${event.location}
          </p>

          <p>
            ${event.description}
          </p>

        </div>

      </div>
    `;

    container.appendChild(div);

  });

}