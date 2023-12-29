document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/images")
    .then((response) => response.json())
    .then((images) => {
      console.log(images);
      const carouselInner = document.querySelector(".carousel-inner");
      const imagesPerSlide = 3;
      for (let i = 0; i < images.length; i += imagesPerSlide) {
        console.log(i);
        const carouselItem = document.createElement("div");
        carouselItem.className =
          i === 0 ? "carousel-item active" : "carousel-item";

        const row = document.createElement("div");
        row.className = "row";

        for (let j = 0; j < imagesPerSlide && i + j < images.length; j++) {
          const image = images[i + j];

          const col = document.createElement("div");
          col.className = "col-lg-4 col-md-6";

          const img = document.createElement("img");
          img.src = image.url;
          img.className = "d-block w-100";
          img.alt = `Image ${image.id}`;
          img.onclick = () => {
            if (image._id) {
              window.location.href = `/image/${image._id}`;
            } else {
              console.error("Image _id is undefined for image:", image);
            }
          };

          col.appendChild(img);
          row.appendChild(col);
        }

        carouselItem.appendChild(row);
        carouselInner.appendChild(carouselItem);
      }
    })
    .catch((error) => console.error("Error fetching images:", error));
});
