// ==== SLIDER IMAGE #1 ====
let index = 0;

function showSlide() {
  const slider = document.querySelector('.slider');
  const items = document.querySelectorAll('.slider .item');
  const container = document.querySelector('.slider-container');

  const itemWidth = items[0].getBoundingClientRect().width;
  const visibleItems = Math.floor(container.offsetWidth / itemWidth);
  const maxIndex = items.length - visibleItems;

  if (index > maxIndex) index = 0;
  if (index < 0) index = maxIndex;

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

window.addEventListener('resize', showSlide);

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
      function toggleMenu() {
        if(menuList.style.maxHeight == "0px")
      {
         menuList.style.maxHeight = "300px";
      }
      else{
        menuList.style.maxHeight = "0px";
      }
      }
      
const slider = document.querySelector('.slider-2');
const track = document.querySelector('.slider-track');
const cards = document.querySelectorAll('.spot-card');

let index = 0;
let autoSlideInterval;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;

function cardsPerView() {
  if (window.innerWidth >= 1200) return 1;
  if (window.innerWidth >= 768) return 1;
  return 1;
}

function slideToIndex() {
  const percentage = 100 / cardsPerView();
  track.style.transform = `translateX(-${index * percentage}%)`;
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    index++;
    if (index > cards.length - cardsPerView()) {
      index = 0;
    }
    slideToIndex();
  }, 3000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

/* ----- DRAG SUPPORT ----- */
function touchStart(e) {
  isDragging = true;
  startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  prevTranslate = -index * (100 / cardsPerView());
  stopAutoSlide();
}

function touchMove(e) {
  if (!isDragging) return;

  const currentX = e.type.includes('mouse')
    ? e.pageX
    : e.touches[0].clientX;

  const diff = currentX - startX;

  track.style.transform =
    `translateX(calc(${prevTranslate}% + ${diff}px))`;
}

function touchEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  const endX = e.type.includes('mouse')
    ? e.pageX
    : e.changedTouches[0].clientX;

  const movedBy = endX - startX;
  const threshold = 80;

  if (movedBy < -threshold && index < cards.length - cardsPerView()) {
    index++;
  }

  if (movedBy > threshold && index > 0) {
    index--;
  }

  slideToIndex();
  startAutoSlide();
}


/* EVENTS */
slider.addEventListener('mouseenter', stopAutoSlide);
slider.addEventListener('mouseleave', startAutoSlide);

slider.addEventListener('mousedown', touchStart);
slider.addEventListener('mousemove', touchMove);
slider.addEventListener('mouseup', touchEnd);
slider.addEventListener('mouseleave', touchEnd);

slider.addEventListener('touchstart', touchStart);
slider.addEventListener('touchmove', touchMove);
slider.addEventListener('touchend', touchEnd);

slider.addEventListener('touchstart', stopAutoSlide);
slider.addEventListener('touchend', startAutoSlide);


window.addEventListener('resize', slideToIndex);

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