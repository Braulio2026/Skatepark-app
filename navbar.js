// ===== LOAD NAVBAR =====
import { supabase } from './js/supabase.js';

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

        await fetch(
          "https://www.google.com/favicon.ico",
          {
            method:"GET",
            mode:"no-cors",
            cache:"no-store"
          }
        );

        networkDot.classList.remove(
          "checking",
          "offline"
        );

        networkDot.classList.add("online");

      } catch {

        networkDot.classList.remove(
          "checking",
          "online"
        );

        networkDot.classList.add("offline");
      }
    }

    // FIRST CHECK
    checkRealConnection();

    // EVERY 15s
    setInterval(checkRealConnection,15000);

    // ONLINE/OFFLINE EVENTS
    window.addEventListener(
      "online",
      checkRealConnection
    );

    window.addEventListener(
      "offline",
      checkRealConnection
    );

    // ===== NAVBAR INTERACTIONS =====

    const menu =
      document.getElementById("menuList");

    const button =
      document.querySelector(".menu-icon");

    if (menu && button) {

      let isOpen = false;

      // TOGGLE MENU
      button.addEventListener("click",(e)=>{

        e.stopPropagation();

        isOpen = !isOpen;

        if (isOpen) {

          menu.classList.add("open");
          button.classList.add("active");

        } else {

          menu.classList.remove("open");
          button.classList.remove("active");
        }
      });

      // PREVENT CLOSE INSIDE MENU
      menu.addEventListener("click",(e)=>{
        e.stopPropagation();
      });

      // CLOSE OUTSIDE
      document.addEventListener("click",()=>{

        menu.classList.remove("open");
        button.classList.remove("active");

        isOpen = false;
      });

      // CLOSE WHEN CLICK LINK
      const links =
        menu.querySelectorAll("a");

      links.forEach(link => {

        link.addEventListener("click",()=>{

          menu.classList.remove("open");
          button.classList.remove("active");

          isOpen = false;
        });
      });
    }

    // ===== LOGOUT =====

    const logoutBtn =
      document.getElementById("navlogoutBtn");

    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        async () => {

          await supabase.auth.signOut();

          window.location.reload();
        }
      );
    }

  });