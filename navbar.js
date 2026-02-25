// Charge the automatically
fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });

// ==== HAMBURGER MENU ====
function toggleMenu() {
  let menuList = document.getElementById("menuList");

  if (menuList.style.maxHeight === "0px") {
    menuList.style.maxHeight = "300px";
  } else {
    menuList.style.maxHeight = "0px";
  }
}