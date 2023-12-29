document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/images")
    .then((response) => response.json())
    .then((images) => {
      const gallery = document.getElementById("gallery");
      images.forEach((image) => {
        const col = document.createElement("div");
        col.className = "col-md-4 gallery-item";

        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";

        const img = document.createElement("img");
        img.src = image.url;
        img.className = "img-fluid gallery-image";
        img.alt = `Image ${image.id}`;
        img.onclick = () => {
          if (image._id) {
            window.location.href = `/image/${image._id}`;
          } else {
            console.error("Image _id is undefined for image:", image);
          }
        };

        const overlay = document.createElement("div");
        overlay.className = "image-overlay";
        overlay.textContent = `${image.title} by ${image.author}`;

        imgContainer.appendChild(img);
        imgContainer.appendChild(overlay);
        col.appendChild(imgContainer);
        gallery.appendChild(col);
      });
    })
    .catch((error) => console.error("Error fetching images:", error));
});
