// ==== SLIDER IMAGE #1 ====
let index = 0;

function centerSlide(clickedItem) {
  const slider = document.querySelector('.slider');
  const items = document.querySelectorAll('.slider .item');
  const container = document.querySelector('.slider-container');

  const containerWidth = container.offsetWidth;
  const itemWidth = clickedItem.offsetWidth + 20;

  const itemOffsetLeft = clickedItem.offsetLeft;

  const centerPosition =
    itemOffsetLeft - (containerWidth / 2) + (clickedItem.offsetWidth / 2);

  slider.style.transform = `translateX(-${centerPosition}px)`;

  // update index so arrows don’t break
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

/* WAIT FOR DOM */
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.select').forEach(button => {
    button.addEventListener('click', (e) => {

      const item = e.target.closest('.item');
      if (!item) return;

      centerSlide(item);

      // OPTIONAL: open map
      const url = button.dataset.map;
      if (url) window.open(url, "_blank");
    });
  });

});

window.addEventListener('resize', showSlide);
window.addEventListener('load', showSlide);

// ===== SEARCH IMPUT ===== 
const searchInput = document.getElementById("searchInput");
const goBtn = document.getElementById("go-btn");
const slider = document.querySelector(".slider");
const items = document.querySelectorAll(".slider .item");

function goToSlide(i) {
  const itemWidth = items[0].offsetWidth;
  slider.style.transform = `translateX(-${itemWidth * i}px)`;
  slider.style.transition = "transform 0.5s ease";
}

goBtn.addEventListener("click", () => {
  const searchValue = searchInput.value.toLowerCase().trim();
  let found = false;

  items.forEach((item, index) => {
    const title = item.querySelector(".title").textContent.toLowerCase();
    if (title.includes(searchValue)) {
      goToSlide(index);
      found = true;
    }
  });

  if (!found) {
    alert("Skatepark no encontrado");
  }
});

// ===== MAP BUTTONS =====
const mapButtons = document.querySelectorAll(".select");

mapButtons.forEach(button => {
  button.addEventListener("click", () => {
    const mapUrl = button.dataset.map;
    if (mapUrl) {
      window.open(mapUrl, "_blank");
    }
  });
});
  
      // ==== SLIDER IMAGE #2 ====
 
(() => {

const slider = document.querySelector('.slider-2');
const track = document.querySelector('.slider-track');
let cards = document.querySelectorAll('.spot-card');

let index = 1;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let autoSlideInterval;

/* CLONE FIRST & LAST */
const firstClone = cards[0].cloneNode(true);
const lastClone = cards[cards.length - 1].cloneNode(true);

track.appendChild(firstClone);
track.insertBefore(lastClone, cards[0]);

cards = document.querySelectorAll('.spot-card');

/* START POSITION */
const slideWidth = slider.offsetWidth;
track.style.transform = `translateX(-${slideWidth * index}px)`;

/* ---------- AUTO SLIDE ---------- */
function startAutoSlide() {
  clearInterval(autoSlideInterval);

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

/* ---------- INFINITE FIX ---------- */
track.addEventListener('transitionend', () => {
  if (cards[index].isSameNode(firstClone)) {
    track.style.transition = "none";
    index = 1;
    track.style.transform = `translateX(-${slider.offsetWidth * index}px)`;
  }

  if (cards[index].isSameNode(lastClone)) {
    track.style.transition = "none";
    index = cards.length - 2;
    track.style.transform = `translateX(-${slider.offsetWidth * index}px)`;
  }
});

/* ---------- DRAG ---------- */
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
  track.style.transform = `translateX(-${slider.offsetWidth * index}px)`;
});

/* INIT */
startAutoSlide();

})();

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("Service Worker registered:", reg.scope))
      .catch(err => console.log("Service Worker error:", err));

  });

}