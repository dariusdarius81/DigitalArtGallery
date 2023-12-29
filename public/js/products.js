document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
});

function checkLoginStatus() {
  fetch("/api/user-status")
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedin) {
        document.getElementById("uploadButton").style.display = "block";
      } else {
        document.getElementById("loginPrompt").style.display = "block";
      }
    })
    .catch((error) => console.error("Error:", error));
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch("/upload", {
    method: "POST",
    body: formData, // send the form data
  })
    .then((response) => {
      if (response.ok) {
        loadProducts(); // reload the products
      } else {
        console.error("Error uploading image");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function loadProducts() {
  const gallery = document.getElementById("productGallery");
  gallery.innerHTML = "";

  fetch("/api/user-images")
    .then((response) => response.json())
    .then((products) => {
      console.log("Products:", products);
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.className = "product-item";
        productDiv.innerHTML = `
                    <img src="${product.url}" alt="${product.title}" />
                    <h3>${product.title}</h3>
                    <p>${product.author}</p>
                    <p>${product.description}</p>
                `;
        gallery.appendChild(productDiv);
      });
    })
    .catch((error) => console.error("Error fetching products:", error));
}
