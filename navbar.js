// Load navbar automatically
fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

    // ==== AFTER NAVBAR ====
    const networkDot = document.getElementById("networkDot");
if (!networkDot) return;

async function checkRealConnection() {
  networkDot.classList.remove("online", "offline");
  networkDot.classList.add("checking");

  try {
    await fetch("https://www.google.com/favicon.ico", {
      method: "GET",
      mode: "no-cors",
      cache: "no-store"
    });

    networkDot.classList.remove("checking", "offline");
    networkDot.classList.add("online");

  } catch (error) {
    networkDot.classList.remove("checking", "online");
    networkDot.classList.add("offline");
  }
}

// first verification
checkRealConnection();

// check every 15 minutes
setInterval(checkRealConnection, 15000);

// also to listen navigator events
window.addEventListener("online", checkRealConnection);
window.addEventListener("offline", checkRealConnection);
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