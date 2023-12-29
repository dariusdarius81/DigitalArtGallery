document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/user-status")
    .then((response) => response.json())
    .then((data) => {
      const userStatusElement = document.getElementById("userStatus");
      if (data.loggedin) {
        userStatusElement.innerHTML = `
                    <a class="nav-link" href="/logout">Logged in as ${data.username}</a>
                `;
      } else {
        userStatusElement.innerHTML = `<a class="nav-link" href="../pages/login.html">Login</a>`;
      }
    })
    .catch((error) => console.error("Error:", error));
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/user-status")
    .then((response) => response.json())
    .then((data) => {
      const uploadButton = document.getElementById("uploadButton");
      if (data.loggedin) {
        uploadButton.style.display = "block";
      } else {
        uploadButton.style.display = "none";
      }
    })
    .catch((error) => console.error("Error:", error));
});
