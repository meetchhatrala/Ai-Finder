import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "./userDatabase.js";
import AiList from "./AiDatabase.js";
import bcrypt from "bcrypt";
var __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

const app = express();
const port = 3000;
var status = 0;
connectDB();

app.use(express.static("./Styles"));
app.use(express.static("/Styles"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

var status = {
  username: Boolean,
  password: Boolean,
}
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
});

const userData = new mongoose.model("userData", userSchema);

//Registration and login...

function reset(){
  status.username = 1;
  status.password = 1;
}

function unset(){
  status.username = 0;
  status.password = 0;
}

async function userCheck(emailOfUser) {
  try {
    const user = await userData.findOne({ email: emailOfUser });
    if (!user) {
      console.log('The email address', emailOfUser, 'does not exist in the database.');
      return false;
    } else {
      console.log('The email address', emailOfUser, 'exists in the database.');
      console.log("User registered");
      return true;
    }
  } catch (err) {
    // Handle any errors that occur during the database query.
    console.error("Error in userCheck:", err);
    throw err;
  }
}
// async function userLogin(username, password) {
//   try {
//     const user = await userData.findOne({ name: username });
//     // console.log(user.name, user.password);
//     if (!user) {
//       console.log('The user', username, 'does not exist in the database.');
//       status.username = 0;
//       status.password = 1;
//       return status;
//     } else {
//       console.log('The user', username, 'exists in the database.');
//       if(password === user.password) {
//         status.username = 1;
//         status.password = 1;
//         return status;
//       }
//       // const passwordMatch = await bcrypt.compare(password, user.password);
//       // return passwordMatch;
//     }
//   } catch (err) {
//     console.error("Error in userLogin:", err);
//     throw err;
//   }
// }

//Requests and Responses

// app.post("/Homepage", async (req, res) => {
//   try {
//     console.log(req.body.name, req.body.password);
//     const userExists = await userLogin(req.body.name, req.body.password);
//     if (userExists.username === true && userExists.password === true) {
//       console.log("\nSuccessful Login");
//       console.log("User: " + req.body.name);
//       status = 1;
//       res.render(__dirname + "/Views/Homepage.ejs", {
//         Status: 1, 
//       });
//       console.log("Status Delivered: " + userExists);
//     } else if((userExists.username === true && userExists.password === false) || (userExists.username === false && userExists.password === true)) {
//       console.log("\nUser not found");
//       reset();
//       res.render(__dirname + "/Views/login.ejs",{
//         failedLogin : true,
//         Status: userExists,
//       });
//       console.log("Status Delivered: " + userExists);
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     console.log("User not found");
//     res.status(500).send("Internal Server Error");
//   }
// });

app.post("/Homepage", async (req, res) => {
  try {
    console.log(req.body.name, req.body.password);
    const userExists = await userLogin(req.body.name, req.body.password);
    
    if (userExists.username === 1 && userExists.password === 1) {
      console.log("\nSuccessful Login");
      console.log("User: " + req.body.name);
      res.render(__dirname + "/Views/Homepage.ejs", {
        Status: 1,
      });
    } else {
      console.log("\nUser not found");
      reset();
      res.render(__dirname + "/Views/login.ejs", {
        failedLogin: true,
        Stats: userExists,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    console.log("User not found");
    res.status(500).send("Internal Server Error");
  }
});

async function userLogin(username, password) {
  const status = { username: 0, password: 0 };

  try {
    const user = await userData.findOne({ name: username });

    if (!user) {
      console.log('The user', username, 'does not exist in the database.');
      status.username = 0;
      status.password = 1;
    } else {
      console.log('The user', username, 'exists in the database.');
      if (password === user.password) {
        status.username = 1;
        status.password = 1;
      }
    }

    return status;
  } catch (err) {
    console.error("Error in userLogin:", err);
    throw err;
  }
}



app.post("/Register", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    designation: req.body.designation,
  };

  try {
    const userExists = await userCheck(req.body.email);
    if (userExists) {
      console.log("\nUser Exists!");
      console.log("Resending registration Page");
      res.render(__dirname + "/Views/register.ejs", {
        accountExists: true,
      });
    } else {
      await userData.insertMany([data]);
      res.render(__dirname + "/Views/Homepage.ejs", {
        Status: 1,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/suggestions", async (req, res) => {
  try {
    const userQuery = req.query.query;

    // Use a MongoDB query to search for suggestions based on user input
    const suggestions = await AiList.find({
      name: { $regex: userQuery, $options: "i" },
    });

    res.json(suggestions);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/Register", (req, res) => {
  res.render(__dirname + "/Views/register.ejs", {
  });
})

app.get("/Logout", (req, res) => {
  console.log("User logged Out!");
  unset();
  res.redirect("/");
});

app.get("/", (req, res) => {
  console.log("Sending file at: " + __dirname + "/Views/Homepage.ejs");
  console.log("User Arrived!");
  res.render(__dirname + "/Views/Homepage.ejs", {
    Status: 0,
  });
});

app.get("/Login", (req, res) => {
  console.log("Sending file at: " + __dirname + "/Views/login.ejs");
  reset();
  res.render(__dirname + "/Views/login.ejs",{
    Stats : status,
  });
});

app.get("/homepage", (req, res) => {
  console.log("Sending file at: " + __dirname + "/Views/Homepage.ejs");
  if(status === 0){
    res.redirect("/");
  }
  // res.render(__dirname + "/Views/Homepage.ejs");
});

app.get("/about", (req, res) => {
  console.log("Sending file at: " + __dirname + "/Views/about.html");
  res.sendFile(__dirname + "/Views/about.html");
});

app.get("/contact_us", (req, res) => {
  console.log("Sending file at: " + __dirname + "/Views/Contact_us.html");
  res.sendFile(__dirname + "/Views/index.html");
});

app.get("/Video_Generator", async (req, res) => {
  try {
    const list = await AiList.find({ Category: "Video" });

    if (list.length === 0) {
      console.log("No Video AI found in the database.");
    } else {
      console.log("Video AI list found:", list);
    }

    res.render("categories.ejs", {
      title: "Video Generator",
      aiList: list,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/Logo_Generator",async (req, res) => {
  try {
    const list = await AiList.find({ Category: "Logo" });

    if (list.length === 0) {
      console.log("No Video AI found in the database.");
    } else {
      console.log("Video AI list found:", list);
    }

    res.render("categories.ejs", {
      title: "Logo Generator",
      aiList: list,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/Music_Generator",async (req, res) => {
  try {
    const list = await AiList.find({ Category: "Image" });

    if (list.length === 0) {
      console.log("No Video AI found in the database.");
    } else {
      console.log("Video AI list found:", list);
    }

    res.render("categories.ejs", {
      title: "Image Generator",
      aiList: list,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/Copy_Writing",async (req, res) => {
  try {
    const list = await AiList.find({ Category: "Text" });

    if (list.length === 0) {
      console.log("No Video AI found in the database.");
    } else {
      console.log("Video AI list found:", list);
    }

    res.render("categories.ejs", {
      title: "Text Generator",
      aiList: list,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
