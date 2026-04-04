// ==== SLIDER IMAGE #1 ====
let index = 0;

/* ================= DATA ================= */
const skateparks = [
  {
    title: "Moravia Skatepark",
    image: "image-skates/Skatepark_moravia.jpg",
    description: "Free public park in San Vicente, Moravia. Open 24h with bowl and street elements. Family-friendly with green areas and playgrounds.",
    map: "https://www.google.com/maps?q=Moravia+Skatepark+Costa+Rica"
  },
  {
    title: "Jose Maria Zeledon Skatepark",
    image: "image-skates/jose_ma_skate.webp",
    description: "Located in Curridabat. Open 8AM–8PM. Features ramps and rails for all levels with a strong local skate community.",
    map: "https://www.google.com/maps?q=Jose+Maria+Zeledon+Skatepark"
  },
  {
    title: "Salvador Skatepark",
    image: "image-skates/savador_skatepark.webp",
    description: "Beginner-friendly park near Sabana (Mantica). Known as a safe local skate spot with basic features.",
    map: "https://www.google.com/maps?q=Salvador+Skatepark+San+Jose"
  },
  {
    title: "Alajuelita Skatepark",
    image: "image-skates/alajuelita_1.jpeg",
    description: "Modern 3-level skatepark opened in 2023. Includes street, bowl, and BMX zones. One of the best in Costa Rica.",
    map: "https://www.google.com/maps?q=Alajuelita+Skatepark"
  },
  {
    title: "Tecma Skatepark",
    image: "image-skates/tecma_2.jpeg",
    description: "The Tecma / Sabanilla skatepark is a small outdoor skate spot located in the Sabanilla area of San José. It features basic street-style obstacles such as rails, a box, an inclined plane, and quarter pipes, making it suitable mainly for beginner to intermediate skaters.",
    map: "https://www.google.com/maps?q=U+Creativa+Sabanilla+Montes+de+Oca+Costa+Rica"
  },
  {
    title: "Lagos de Lindora Skatepark",
    image: "image-skates/santa_ana_skatepark.jpeg",
    description: "Planned skatepark in Santa Ana (Lindora area). Project announced by the municipality.",
    map: "https://www.google.com/maps?q=Lindora+lagos+skatepark"
  },
  {
    title: "Plaza Viquez Skatepark",
    image: "image-skates/viquez_skat2.jpeg",
    description: "Concrete skatepark in Cartago behind Escuela Vial. Open 9AM–5PM. Includes rails, ledges, and quarter pipes.",
    map: "https://www.google.com/maps?q=Plaza+gonzalez+viquez+skatepark"
  },
  {
    title: "Bowl Guachipelin Escazu",
    image: "image-skates/escazu_skate3.jpeg",
    description: "Recreational park in Escazú with skate areas, courts, and playgrounds. Great for families and skating.",
    map: "" // no map provided yet
  },
  {
    title: "Zapote Skatepark",
    image: "image-skates/zapote_skate2.jpg",
    description: "Street-style municipal park in Zapote with boxes, ramps, and ledges. Popular local skate spot.",
    map: "https://www.google.com/maps?q=Zapote+Skatepark"
  },
  {
    title: "Los Lagos Skatepark",
    image: "image-skates/lagos_skat7.jpeg",
    description: "Large modern park in Heredia with street, bowl, and pumptrack areas. Suitable for all skill levels.",
    map: "https://www.google.com/maps?q=Los+lagos+skatepark"
  }
 ];

/* ================= FUNCTIONS ================= */
function centerSlide(clickedItem) {
  const slider = document.querySelector('.slider');
  const container = document.querySelector('.slider-container');

  const containerWidth = container.offsetWidth;
  const itemWidth = clickedItem.offsetWidth + 20;
  const itemOffsetLeft = clickedItem.offsetLeft;

  const centerPosition =
    itemOffsetLeft - (containerWidth / 2) + (clickedItem.offsetWidth / 2);

  slider.style.transform = `translateX(-${centerPosition}px)`;

  index = Math.round(itemOffsetLeft / itemWidth);
}

function showSlide() {
  const slider = document.querySelector('.slider');
  const items = document.querySelectorAll('.slider .item');
  const container = document.querySelector('.slider-container');

  if (!items.length) return;

  const gap = 20;
  const itemWidth = items[0].getBoundingClientRect().width + gap;

  const visibleItems = Math.floor(container.offsetWidth / itemWidth);
  const maxIndex = items.length - visibleItems;

  index = Math.max(0, Math.min(index, maxIndex));

  slider.style.transform = `translateX(-${index * itemWidth}px)`;
}

function left() {
  index--;
  showSlide();
}

function right() {
  index++;
  showSlide();
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {

  const slider = document.querySelector('.slider');
  const searchInput = document.getElementById("searchInput");
  const goBtn = document.getElementById("go-btn");
  const datalist = document.getElementById("suggestions");

  /* ---------- GENERATE SLIDES ---------- */
  skateparks.forEach(park => {
    slider.innerHTML += `
      <div class="item">
          <div class="image">
              <img src="${park.image}" loading="lazy" alt="${park.title}">
          </div>
          <div class="information">
              <div class="title">${park.title}</div>
              <span>${park.description}</span>
              <button class="select" data-map="${park.map}">
                  Go to map
              </button>
          </div>
      </div>
    `;
  });

  /* ---------- GENERATE SEARCH SUGGESTIONS ---------- */
  skateparks.forEach(park => {
    const option = document.createElement("option");
    option.value = park.title;
    datalist.appendChild(option);
  });

  /* ---------- BUTTON EVENTS (MAP + CENTER) ---------- */
  document.querySelectorAll('.select').forEach(button => {
    button.addEventListener('click', (e) => {

      const item = e.target.closest('.item');
      if (!item) return;

      centerSlide(item);

      const url = e.target.dataset.map;
      if (url) window.open(url, "_blank");
    });
  });

  /* ---------- SEARCH ---------- */
  goBtn.addEventListener("click", () => {
    const searchValue = searchInput.value.toLowerCase().trim();
    const items = document.querySelectorAll(".slider .item");

    let foundIndex = -1;

    items.forEach((item, i) => {
      const title = item.querySelector(".title").textContent.toLowerCase();

      if (title.includes(searchValue) && foundIndex === -1) {
        foundIndex = i;
      }
    });

    if (foundIndex !== -1) {
      index = foundIndex;
      showSlide();

      // highlight
      items[foundIndex].classList.add("active");
      setTimeout(() => {
        items[foundIndex].classList.remove("active");
      }, 1500);

    } else {
      alert("Skatepark no encontrado");
    }
  });

  /* ---------- ENTER KEY ---------- */
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      goBtn.click();
    }
  });

  /* ---------- INITIAL POSITION ---------- */
  showSlide();
});

/* ================= GLOBAL EVENTS ================= */
window.addEventListener('resize', showSlide);
window.addEventListener('load', showSlide);

// ==== SLIDER IMAGE #2 (DRAG + INFINITE) ====
(() => {

  const slider = document.querySelector('.slider-2');
  const track = document.querySelector('.slider-track');

  if (!slider || !track) return; // safety

  let cards = document.querySelectorAll('.spot-card');

  let index = 1;
  let isDragging = false;
  let startX = 0;
  let prevTranslate = 0;
  let autoSlideInterval;

  /* ---------- CLONE FIRST & LAST ---------- */
  const firstClone = cards[0].cloneNode(true);
  const lastClone = cards[cards.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, cards[0]);

  cards = document.querySelectorAll('.spot-card');

  /* ---------- START POSITION ---------- */
  function setPosition() {
    const slideWidth = slider.offsetWidth;
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  setPosition();

  /* ---------- AUTO SLIDE ---------- */
  function startAutoSlide() {
    stopAutoSlide();

    autoSlideInterval = setInterval(() => {
      moveToNext();
    }, 3000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  /* ---------- MOVE ---------- */
  function moveToNext() {
    if (index >= cards.length - 1) return;
    index++;
    moveSlider();
  }

  function moveToPrev() {
    if (index <= 0) return;
    index--;
    moveSlider();
  }

  function moveSlider() {
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${slider.offsetWidth * index}px)`;
  }

  /* ---------- INFINITE LOOP FIX ---------- */
  track.addEventListener('transitionend', () => {

    if (cards[index].isSameNode(firstClone)) {
      track.style.transition = "none";
      index = 1;
      setPosition();
    }

    if (cards[index].isSameNode(lastClone)) {
      track.style.transition = "none";
      index = cards.length - 2;
      setPosition();
    }
  });

  /* ---------- DRAG / SWIPE ---------- */
  function touchStart(e) {
    isDragging = true;
    stopAutoSlide();

    startX = e.type.includes('mouse')
      ? e.pageX
      : e.touches[0].clientX;

    prevTranslate = -slider.offsetWidth * index;
  }

  function touchMove(e) {
    if (!isDragging) return;

    const currentX = e.type.includes('mouse')
      ? e.pageX
      : e.touches[0].clientX;

    const diff = currentX - startX;
    track.style.transform = `translateX(${prevTranslate + diff}px)`;
  }

  function touchEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    const endX = e.type.includes('mouse')
      ? e.pageX
      : e.changedTouches[0].clientX;

    const movedBy = endX - startX;

    if (movedBy < -100) moveToNext();
    else if (movedBy > 100) moveToPrev();
    else moveSlider();

    startAutoSlide();
  }

  /* ---------- EVENTS ---------- */
  slider.addEventListener('mousedown', touchStart);
  slider.addEventListener('mousemove', touchMove);
  slider.addEventListener('mouseup', touchEnd);
  slider.addEventListener('mouseleave', touchEnd);

  slider.addEventListener('touchstart', touchStart);
  slider.addEventListener('touchmove', touchMove);
  slider.addEventListener('touchend', touchEnd);

  slider.addEventListener('mouseenter', stopAutoSlide);
  slider.addEventListener('mouseleave', startAutoSlide);

  window.addEventListener('resize', () => {
    track.style.transition = "none";
    setPosition();
  });

  /* ---------- INIT ---------- */
  startAutoSlide();

})();

// =======================
// EVENTS SYSTEM
// =======================

document.addEventListener("DOMContentLoaded", () => {

  const eventForm = document.getElementById("eventForm");
  const userPosts = document.getElementById("userPosts");
  const imageInput = document.getElementById("image");
  const STORAGE_KEY = "userPostsData";

  if (!eventForm || !userPosts) return;

  // ---------- CONVERT IMAGE ----------
  function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);

      reader.readAsDataURL(file);
    });
  }

  // ---------- CREATE POST ----------
  function createPostCard(event, index) {
    return `
      <div class="post-card">
        <img src="${event.imageUrl}" alt="Post image">

        <div class="post-content">
          <h4>${event.title}</h4>
          <p>
            ${event.description}
            <br><br>
            📅 ${event.date}
          </p>

          <a href="${event.location || '#'}" target="_blank">
            📍 View location
          </a>

          <button class="delete-btn" data-index="${index}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }

  // ---------- RENDER ALL POSTS ----------
  function renderPosts(posts) {
    userPosts.innerHTML = "";

    posts.forEach((post, index) => {
      userPosts.insertAdjacentHTML("beforeend", createPostCard(post, index));
    });
  }

  // ---------- SAVE ----------
  function savePostToStorage(post) {
    const existingPosts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    existingPosts.unshift(post);

    const MAX_POSTS = 10;
    if (existingPosts.length > MAX_POSTS) {
      existingPosts.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPosts));
  }

  // ---------- LOAD ----------
  function loadPostsFromStorage() {
    const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    renderPosts(savedPosts);
  }

  // ---------- DELETE ----------
  userPosts.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = Number(e.target.dataset.index);

      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      posts.splice(index, 1);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));

      renderPosts(posts); // 🔥 no reload needed
    }
  });

  // ---------- FORM ----------
  eventForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const imageFile = imageInput.files[0];

    let imageUrl = "image-skates/spot_1.jpeg";

    if (imageFile) {
      imageUrl = await convertImageToBase64(imageFile);
    }

    const newEvent = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      date: document.getElementById("date").value,
      location: document.getElementById("location").value,
      imageUrl: imageUrl
    };

    savePostToStorage(newEvent);

    loadPostsFromStorage(); // 🔥 re-render correctly

    this.reset();
    document.getElementById("file-name").textContent = "No file selected";
  });

  // ---------- FILE NAME ----------
  imageInput.addEventListener("change", () => {
    const fileNameDisplay = document.getElementById("file-name");

    if (imageInput.files.length > 0) {
      fileNameDisplay.textContent = imageInput.files[0].name;
    } else {
      fileNameDisplay.textContent = "No file selected";
    }
  });

  // ---------- INIT ----------
  loadPostsFromStorage();

});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("Service Worker registered:", reg.scope))
      .catch(err => console.log("Service Worker error:", err));
  });
}