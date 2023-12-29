const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const { connectDB, getDb } = require("./mongoDB");
const { ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "39dk3id93kdie93kdid39k39dk",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/api/images", async (req, res) => {
  try {
    const db = getDb();
    const images = await db.collection("images").find({}).toArray();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching images");
  }
});

app.get("/image/:id", async (req, res) => {
  try {
    const db = getDb();
    const imageId = new ObjectId(req.params.id); // Convert to ObjectId
    const image = await db.collection("images").findOne({ _id: imageId });

    if (image) {
      console.log("Session Logged In:", req.session.loggedin);
      console.log("Session Username:", req.session.username);
      console.log("Image Author:", image.author);
      const imageUrl = image.url.startsWith("/")
        ? image.url
        : "/uploads/" + image.url;

      const deleteButtonHtml =
        req.session.loggedin && req.session.username === image.author
          ? `<button id="deleteButton" class="btn btn-danger" onclick="deleteImage('${image._id}')">Delete Image</button>`
          : "";

      const responseHtml = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${image.title} | Digital Art Gallery</title>
                  <link rel="stylesheet" href="/css/image-style.css">
                  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
              </head>
              <body>
                  <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                      <div class="container">
                          <a class="navbar-brand" href="../index.html">Digital Art Gallery</a>
                      </div>
                  </nav>
                  <header class="bg-light py-3">
                      <div class="container">
                          <h1 class="display-4">${image.title}</h1>
                          <p class="lead">By: ${image.author}</p>
                      </div>
                  </header>
                  <main class="container mt-4">
                      <div class="image-page shadow-sm p-3 mb-5 bg-white rounded">
                      <img src="${imageUrl}" alt="Image ${
        image.title
      }" class="img-fluid rounded">

      <p class="description mt-3">${image.description}</p>
      ${deleteButtonHtml}                      </div>
                  </main>

                  <script>
                  function deleteImage(imageId) {
                      if (confirm('Are you sure you want to delete this image?')) {
                          fetch('/delete-image/' + imageId, { method: 'DELETE' })
                          .then(response => {
                              if (response.ok) {
                                  window.location.href = '/'; // redirect to home after deletion
                              } else {
                                  alert('Error deleting image');
                              }
                          });
                      }
                  }
                  </script>

                  <footer class="bg-light text-center text-lg-start">
                      <div class="text-center p-3">
                          &copy; ${new Date().getFullYear()} Digital Art Gallery. All rights reserved.
                      </div>
                  </footer>
              </body>
              </html>
          `;
      //  Inspect the session state to ensure it correctly identifies the logged-in user.

      res.send(responseHtml);
    } else {
      res.status(404).send("Image not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching image");
  }
});

app.delete("/delete-image/:id", async (req, res) => {
  if (!req.session.loggedin) {
    return res.status(403).send("User not logged in");
  }

  try {
    const db = getDb();
    const imageId = new ObjectId(req.params.id);
    const image = await db.collection("images").findOne({ _id: imageId });

    if (!image) {
      return res.status(404).send("Image not found");
    }

    if (image.author !== req.session.username) {
      return res
        .status(403)
        .send("You are not authorized to delete this image");
    }

    await db.collection("images").deleteOne({ _id: imageId });
    res.status(200).send("Image deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting image");
  }
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const db = getDb();
    const user = await db.collection("users").findOne({ username: username });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
      } else {
        res.status(401).send("Incorrect Username and/or Password!");
      }
    } else {
      res.status(401).send("Username does not exist.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/user-images", async (req, res) => {
  if (!req.session.loggedin) {
    return res.status(403).send("User not logged in");
  }

  try {
    const db = getDb();
    const images = await db
      .collection("images")
      .find({ author: req.session.username })
      .toArray();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user images");
  }
});

app.get("/api/user-status", (req, res) => {
  res.json({ loggedin: req.session.loggedin, username: req.session.username });
});

app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error in session destruction:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/");
    }
  });
});

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.session.loggedin) {
    return res.status(403).send("User not logged in");
  }

  try {
    const db = getDb();
    const imgData = {
      title: req.body.title,
      author: req.session.username, // The logged-in user is the author
      description: req.body.description,
      url: "/uploads/" + req.file.filename,
    };
    await db.collection("images").insertOne(imgData);
    res.redirect("/"); // Redirect as needed
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading image");
  }
});

app.get("/home", function (req, res) {
  if (req.session.loggedin) {
    res.redirect("/");
  } else {
    res.send("Please login to view this page!");
  }
});

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
