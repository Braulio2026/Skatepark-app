import { supabase } from './supabase.js';

// =======================
// AUTH SYSTEM
// =======================

const getInput = id => document.getElementById(id)?.value.trim();

function validateAuth(email, password) {
  if (!email || !password) {
    alert("Complete all fields");
    return false;
  }
  return true;
}

async function handleAuth(type) {

  const email = getInput("email");
  const password = getInput("password");

  if (!validateAuth(email, password)) return;

  if (type === "signup" && password.length < 6) {
    alert("Password needs 6+ characters");
    return;
  }

  const { error } =
    type === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({
          email,
          password
        });

  if (error) {

    if (error.message.includes("rate limit"))
      return alert("Too many requests. Wait a minute.");

    if (error.message.includes("already registered"))
      return alert("User already registered.");

    if (error.message.includes("Email not confirmed"))
      return alert("Confirm your email first.");

    return alert(error.message);
  }

  alert(
    type === "signup"
      ? "✅ Account created! Check your email."
      : "✅ Logged in!"
  );
}

// =======================
// UI
// =======================

function updateUI(session) {

  const userInfo =
    document.getElementById("userInfo");

  const authScreen =
    document.getElementById("authScreen");

  const mainApp =
    document.getElementById("mainApp");

  if (!userInfo || !authScreen || !mainApp)
    return;

  const user = session?.user;

  userInfo.textContent = user
    ? `Logged as: ${user.email}`
    : "No user logged";

  authScreen.style.display =
    user ? "none" : "flex";

  mainApp.style.display =
    user ? "block" : "none";
}

// =======================
// SESSION
// =======================

async function checkUser(session = null) {

  if (!session) {

    const { data, error } =
      await supabase.auth.getSession();

    if (error) {
      updateUI(null);
      return;
    }

    session = data.session;
  }

  updateUI(session);
}

// =======================
// LOGOUT
// =======================

async function logout() {

  await supabase.auth.signOut();

  updateUI(null);
}

// =======================
// INIT
// =======================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const signupBtn =
      document.getElementById("signupBtn");

    const loginBtn =
      document.getElementById("loginBtn");

    const logoutBtn =
      document.getElementById("logoutBtn");

    signupBtn?.addEventListener(
      "click",
      () => handleAuth("signup")
    );

    loginBtn?.addEventListener(
      "click",
      () => handleAuth("login")
    );

    logoutBtn?.addEventListener(
      "click",
      logout
    );

    checkUser();

    const {
      data: { subscription }
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {

          updateUI(session);

        }
      );

    window.addEventListener(
      "beforeunload",
      () => subscription?.unsubscribe()
    );
  }
);