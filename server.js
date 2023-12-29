const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const { connectDB, getDb } = require("./mongoDB");
const { ObjectId } = require("mongodb"); // Import ObjectId

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

const images = [
  {
    id: 1,
    url: "/images/monalisa.jpg",
    title: "MONA LISA",
    author: "Leonardo da Vinci",
    description:
      "The 'Mona Lisa', also known as La Gioconda, is an iconic portrait created by the Italian master Leonardo da Vinci in the 16th century. It features a woman with an enigmatic smile, gazing at us from a mysterious background, with a subtle and intriguing expression that has captivated imaginations for centuries. It is considered one of the most valuable works of art in the world.",
  },
  {
    id: 2,
    url: "/images/pearlear.jpg",
    title: "GIRL WITH A PEARL EARRING",
    author: "Johannes Vermeer",
    description:
      "This remarkable painting by the Dutch artist Johannes Vermeer, known as the 'Girl with a Pearl Earring,' depicts a young woman in a captivating portrait. The play of light and shadows creates a mysterious interplay of colors and details, with the pearl earring in her ear drawing attention by gleaming in the darkness. This remarkable artwork exudes timeless mystery and elegance",
  },
  {
    id: 3,
    url: "/images/starry.jpg",
    title: "THE STARRY NIGHT",
    author: "Vincent van Gogh",
    description:
      "The 'Starry Night' is an iconic painting by the Dutch post-impressionist artist Vincent van Gogh. It depicts a swirling night sky filled with vibrant stars, a crescent moon, and a sleepy village below. The expressive brushwork and vivid colors create a sense of movement and emotion, making it one of van Gogh's most famous and beloved works of art.",
  },
  {
    id: 4,
    url: "/images/lastsupper.jpg",
    title: "THE LAST SUPPER",
    author: "Leonardo da Vinci",
    description:
      "The 'Last Supper' is a famous mural painting created by the Italian Renaissance artist Leonardo da Vinci in the 15th century. It depicts the scene from the Bible in which Jesus Christ shares his last meal with his disciples before his crucifixion. The painting is renowned for its masterful use of perspective and composition, as well as its emotional intensity.",
  },
];

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
      const imageUrl = image.url.startsWith("/")
        ? image.url
        : "/uploads/" + image.url;

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
                      </div>
                  </main>
                  <footer class="bg-light text-center text-lg-start">
                      <div class="text-center p-3">
                          &copy; ${new Date().getFullYear()} Digital Art Gallery. All rights reserved.
                      </div>
                  </footer>
              </body>
              </html>
          `;
      res.send(responseHtml);
    } else {
      res.status(404).send("Image not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching image");
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
  if (req.session.loggedin) {
    res.json({ loggedin: true, username: req.session.username });
  } else {
    res.json({ loggedin: false });
  }
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
      author: req.session.username, // Use the logged-in user's username
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
