// ===== SLIDER =====
let index = 0;

function showSlide() {
  const slider = document.querySelector('.slider');
  slider.style.transform = `translateX(${-index * 100}%)`;
}

function left() {
  const items = document.querySelectorAll('.slider .item');
  index = index > 0 ? index - 1 : items.length - 1;
  showSlide();
}

function right() {
  const items = document.querySelectorAll('.slider .item');
  index = index < items.length - 1 ? index + 1 : 0;
  showSlide();
}

// ===== SEARCH =====
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

// ==== HAMBURGER-MENU ====
    let menuList = document.getElementById("menuList")
      menuList.style.maxHeight = "0px";

      function toggleMenu() {
        if(menuList.style.maxHeight == "0px")
      {
         menuList.style.maxHeight = "300px";
      }
      else{
        menuList.style.maxHeight = "0px";
      }
      }
 