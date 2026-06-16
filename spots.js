import { supabase } from "./js/supabase.js";

// =======================
// ELEMENTS
// =======================

const spotForm =
  document.getElementById("spotForm");

const spotImageInput =
  document.getElementById("spot-image");

// =======================
// SAVE COMMUNITY SPOT
// =======================

async function saveSpot(spot) {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Login required");
    return;
  }

  const { error } = await supabase
    .from("community_spots")
    .insert([
      {
        description: spot.description,
        location: spot.location,
        image_url: spot.imageUrl,
        user_id: user.id
      }
    ]);

  if (error) {

    console.error(
      "❌ Error saving spot:",
      error.message
    );

    alert(error.message);
  }
}

// =======================
// IMAGE UPLOAD
// =======================

async function uploadImage(file) {

  const fileName =
    Date.now() + "-" + file.name;

  const { error } =
    await supabase.storage
      .from("events-images")
      .upload(fileName, file);

  if (error) {

    console.error(
      "❌ Upload error:",
      error.message
    );

    return null;
  }

  const { data } =
    supabase.storage
      .from("events-images")
      .getPublicUrl(fileName);

  return data.publicUrl;
}

// =======================
// LOAD COMMUNITY SPOTS
// =======================

async function loadCommunitySpots() {

  const container =
    document.getElementById(
      "community-spots"
    );

  if (!container) return;

  const { data, error } =
    await supabase
      .from("community_spots")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {

    console.error(
      "❌ Error loading spots:",
      error.message
    );

    return;
  }

  container.innerHTML = "";

  data.forEach(spot => {

   container.insertAdjacentHTML(
  "beforeend",
  `
  <div class="spot-card">

    <div class="spot-header">
      👤 Community Skater
    </div>

    <img
      src="${spot.image_url}"
      alt="Community Spot"
      class="spot-image"
    >

    <div class="spot-content">

      <p>${spot.description}</p>

      <a
        href="${spot.location}"
        target="_blank"
        rel="noopener noreferrer"
        class="map-btn"
      >
        📍 View Location
      </a>

    </div>

  </div>
  `
);

});
}

// =======================
// SPOT FORM SUBMIT
// =======================

if (spotForm) {

  spotForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      let imageUrl =
        "image-skates/spot_1.jpeg";

      const imageFile =
        spotImageInput.files[0];

      if (imageFile) {

        const uploadedUrl =
          await uploadImage(imageFile);

        if (uploadedUrl)
          imageUrl = uploadedUrl;
      }

      const newSpot = {

        description:
          document
            .getElementById(
              "spot-description"
            )
            .value.trim(),

        location:
          document
            .getElementById(
              "spot-location"
            )
            .value.trim(),

        imageUrl

      };

      if (
        !newSpot.description ||
        !newSpot.location
      ) {

        alert(
          "All fields required"
        );

        return;
      }

      await saveSpot(newSpot);

      await loadCommunitySpots();

      spotForm.reset();

    }
  );
}

const imageInput = document.getElementById("spot-image");
const fileName = document.getElementById("spot-file-name");

imageInput.addEventListener("change", () => {
  if (imageInput.files.length > 0) {
    fileName.textContent = imageInput.files[0].name;
  } else {
    fileName.textContent = "No file selected";
  }
});

// =======================
// INIT
// =======================

loadCommunitySpots();