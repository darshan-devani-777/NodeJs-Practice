let user = null;
let token = null;

try {
  let cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if (cookiePair[0].trim() == "logged_in_user") {
      user = decodeURIComponent(cookiePair[1]);
    }
    if (cookiePair[0].trim() == "accessToken") {
      token = decodeURIComponent(cookiePair[1]);
    }
  }
  if (user) {
    user = JSON.parse(user);
  }
} catch (error) {
  toastr.error(error);
  console.error("Error fetching data:", error);
  // window.location.replace("/users/admin/login");
}
