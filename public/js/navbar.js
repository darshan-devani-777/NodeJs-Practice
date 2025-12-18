// Function to get the latest user data from cookie
function getLatestUserData() {
  try {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
      let cookiePair = cookieArr[i].split("=");
      if (cookiePair[0].trim() == "logged_in_user") {
        return JSON.parse(decodeURIComponent(cookiePair[1]));
      }
    }
  } catch (error) {
    console.error("Error reading user cookie:", error);
  }
  return null;
}

// Update navbar with user data
function updateNavbar() {
  const userData = getLatestUserData();
  if (userData) {
    document.getElementById("admin_name").innerText = `${userData.first_name} ${userData.last_name}`;
    document.getElementById("admin_image").src = userData.profile_image
      ? userData.profile_image
      : '/public/dist/img/photo1.png';
  }
}

// Initial update
if (user) {
  updateNavbar();
}

// Listen for profile updates (if triggered from other scripts)
window.addEventListener('storage', function(e) {
  if (e.key === 'profileUpdated') {
    updateNavbar();
  }
});
