// ===== LOAD NAVBAR =====
fetch("navbar.html")
  .then(response => response.text())
  .then(data => {

    // Insert navbar into page
    document.getElementById("navbar").innerHTML = data;

    // ===== NETWORK INDICATOR =====
    const networkDot = document.getElementById("networkDot");
    if (!networkDot) return;

    async function checkRealConnection() {

      networkDot.classList.remove("online","offline");
      networkDot.classList.add("checking");

      try {

        await fetch("https://www.google.com/favicon.ico", {
          method: "GET",
          mode: "no-cors",
          cache: "no-store"
        });

        networkDot.classList.remove("checking","offline");
        networkDot.classList.add("online");

      } catch {

        networkDot.classList.remove("checking","online");
        networkDot.classList.add("offline");

      }

    }

    // First check
    checkRealConnection();

    // Check every 15 seconds
    setInterval(checkRealConnection,15000);

    // Browser online/offline events
    window.addEventListener("online",checkRealConnection);
    window.addEventListener("offline",checkRealConnection);


    // ===== CLOSE MENU WHEN CLICKING A LINK =====
    const links = document.querySelectorAll("#menuList a");

    links.forEach(link => {
      link.addEventListener("click", () => {

        const menu = document.getElementById("menuList");
        const icon = document.querySelector(".menu-icon");

        if(menu && icon){
          menu.classList.remove("open");
          icon.classList.remove("active");
        }

      });
    });

  });


// ===== HAMBURGER MENU =====
function toggleMenu(){

  const menu = document.getElementById("menuList");
  const icon = document.querySelector(".menu-icon");

  if(!menu || !icon) return;

  menu.classList.toggle("open");
  icon.classList.toggle("active");

}