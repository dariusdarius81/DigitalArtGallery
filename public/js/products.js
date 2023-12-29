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
  const form = document
    .getElementById("uploadForm")
    .addEventListener("submit", handleFormSubmit);

  const formData = new FormData(form);

  fetch("/upload", {
    method: "POST",
    body: formData, // send the form data
  })
    .then((response) => {
      if (response.ok) {
        loadProducts(); // Reload the products
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
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.className = "product-item";
        productDiv.innerHTML = `
                      <img src="${product.imageUrl}" alt="${product.title}" />
                      <h3>${product.title}</h3>
                      <p>${product.author}</p>
                      <p>${product.description}</p>
                      <button onclick="deleteProduct('${product.id}')">Delete</button>
                  `;
        gallery.appendChild(productDiv);
      });
    })
    .catch((error) => console.error("Error fetching products:", error));
}

function deleteProduct(productId) {
  fetch(`/api/delete-product/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        loadProducts(); // Reload the products to reflect the deletion
      } else {
        console.error("Error deleting product");
      }
    })
    .catch((error) => console.error("Error:", error));
}

app.delete("/api/delete-product/:productId", (req, res) => {
  const productId = req.params.productId;

  // Assuming you are using a MongoDB database
  const db = getDb();
  db.collection("products")
    .deleteOne({ _id: productId })
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).send("Successfully deleted");
      } else {
        res.status(404).send("Product not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
