const Express = require("express");
const Mongoose = require("mongoose");
const Cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Bcrypt = require("bcrypt");
const userModel = require("./models/Users");
const adminModel = require("./models/Admin");
const collectModel = require("./models/Collector");
const addcollectorModel = require("./models/AddCollector");
const userfeedbackModel = require("./models/UserFeedback");
const wastepickupModel = require("./models/WastePickup");
const transactionModel = require("./models/transaction");
const assigntaskModel = require("./models/AssignTask");
const CompletedTaskModel = require("./models/CompletedTask");


let app = Express();
app.use(Express.json());
app.use(Cors());

Mongoose.connect(
  "mongodb+srv://safabeegum:mongodb24@cluster0.pbzbbey.mongodb.net/waste_mngmt?retryWrites=true&w=majority&appName=Cluster0"
);

// ---------------------------------------------------ADMIN SIGNUP & SIGNIN BEGIN----------------------------------------------------------------

//AdminSignUp API
app.post("/adminsignup", (req, res) => {
  let input = req.body;
  let hashedPassword = Bcrypt.hashSync(input.password, 10);
  input.password = hashedPassword;
  //console.log(input)
  let result = new adminModel(input);
  result.save();
  res.json({ status: "Success" });
});

//AdminSignIn API
app.post("/adminsignin", async (req, res) => {
  let input = req.body;
  let result = adminModel
    .find({ username: req.body.username })
    .then((items) => {
      if (items.length > 0) {
        const passwordValidator = Bcrypt.compareSync(
          req.body.password,
          items[0].password
        );
        if (passwordValidator) {
          jwt.sign(
            { username: req.body.username },
            "waste_mngmt",
            { expiresIn: "1d" },
            (error, token) => {
              if (error) {
                res.json({ status: "Error", Error: error });
              } else {
                res.json({
                  status: "Success",
                  token: token,
                  adminId: items[0]._id,
                });
              }
            }
          );
        } else {
          res.json({ status: "Incorrect Password" });
        }
      } else {
        res.json({ status: "Invalid Username" });
      }
    })
    .catch();
});

//----------------------------------------------------------------ADMIN SIGNUP & SIGNIN END----------------------------------------------------------------

//----------------------------------------------------------------ADMIN BEGIN--------------------------------------------------------------------

//----------------------------------------------------------------ADD COLLECTOR BEGIN----------------------------------------------------------------

//AddCollector API
app.post("/addcollector", (req, res) => {
  let input = req.body;
  let token = req.headers.token;

  //verifying token is valid  (start)
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (decoded && decoded.username) {
      let result = new addcollectorModel(input);
      await result.save();
      res.json({ status: "Success" });
    } else {
      res.json({ status: "Invalid Authentication" });
    }
  });
  //  (end)
});

//----------------------------------------------------------------ADD COLLECTOR END----------------------------------------------------------------

//----------------------------------------------------------------VIEW COLLECTOR BEGIN-------------------------------------------------------------

//ViewCollector API
app.post("/viewcollector", (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (decoded && decoded.username) {
      addcollectorModel
        .find()
        .then((items) => {
          res.json(items);
        })
        .catch((error) => {
          res.json({ status: "Error" });
        });
    } else {
      res.json({ status: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------VIEW COLLECTOR END-------------------------------------------------------------

//----------------------------------------------------------------VIEW USER BEGIN-------------------------------------------------------------

//ViewUser API
app.post("/viewuser", (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (decoded && decoded.username) {
      userModel
        .find()
        .then((items) => {
          res.json(items);
        })
        .catch((error) => {
          res.json({ status: "Error" });
        });
    } else {
      res.json({ status: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------VIEW USER END-------------------------------------------------------------

// //----------------------------------------------------------------VIEW REQUEST BEGIN--------------------------------------------------------

// Get User Address API
app.get("/getUserAddress/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
      // Find the user by ID
      const user = await userModel.findById(userId);

      if (user) {
          // Send back the user's address
          return res.json({ address: user.address });
      } else {
          return res.status(404).json({ status: "User Not Found" });
      }
  } catch (error) {
      console.error("Error fetching user address:", error);
      return res.status(500).json({ status: "Error fetching address" });
  }
});


// View WasteRequest API
app.post("/viewrequest", async (req, res) => {
  let token = req.headers.token;
  
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
      if (decoded && decoded.username) {
          try {
              // Find all waste pickup requests
              const requestItems = await wastepickupModel.find().lean();
              
              // Use Promise.all to retrieve user details
              const pickuprequest = await Promise.all(requestItems.map(async (item) => {
                  // Query the user and select required fields in one call
                  const user = await userModel.findById(item.userId)
                      .select('email first_name last_name address latitude longitude'); // Include latitude and longitude
                  
                  return {
                      ...item,
                      email: user ? user.email : 'Unknown',  // Default to 'Unknown' if not found
                      first_name: user ? user.first_name : 'Unknown', 
                      last_name: user ? user.last_name : 'Unknown', 
                      address: user ? user.address : 'Unknown',
                      latitude: user ? user.latitude : null,   // Include latitude
                      longitude: user ? user.longitude : null, // Include longitude
                      pickupId: item.pickupId, // Include pickupId directly from the item
                  };
              }));

              // Send the response
              res.json(pickuprequest);
          } catch (error) {
              console.error("Error retrieving request", error);
              res.json({ "status": "Error", "message": error.message });
          }
      } else {
          res.json({ "status": "Invalid Authentication" });
      }
  });
});

// Get Requests API
app.get("/getRequests", async (req, res) => {
  try {
      const token = req.headers.token;
      if (!token) {
          return res.status(403).json({ status: "Unauthorized" });
      }

      jwt.verify(token, "waste_mngmt", async (error, decoded) => {
          if (error) {
              return res.status(401).json({ status: "Invalid Token" });
          }

          // Fetch only requests without an assigned worker
          const requests = await wastepickupModel.find({ assignedWorker: null })
              .populate("userId", "first_name last_name address latitude longitude");

          // Map through requests and handle null userIds
          const response = requests.map((request) => {
              const user = request.userId || {};
              return {
                  ...request.toObject(), // Convert mongoose document to plain object
                  first_name: user.first_name || "Unknown",
                  last_name: user.last_name || "Unknown",
                  address: user.address || "Unknown",
                  latitude: user.latitude || null,
                  longitude: user.longitude || null,
              };
          });

          return res.json(response);
      });
  } catch (error) {
      console.error("Error fetching requests:", error);
      return res.status(500).json({ status: "Error fetching requests", error: error.message });
  }
});

// Get Workers API
app.get("/getWorkers", async (req, res) => {
  try {
      const token = req.headers.token;
      if (!token) {
          return res.status(403).json({ status: "Unauthorized" });
      }

      jwt.verify(token, "waste_mngmt", async (error, decoded) => {
          if (error) {
              return res.status(401).json({ status: "Invalid Token" });
          }

          const workers = await collectModel.find(); // Fetch all workers
          return res.json(workers);
      });
  } catch (error) {
      console.error("Error fetching workers:", error);
      return res.status(500).json({ status: "Error fetching workers", error: error.message });
  }
});

// Assign Task API
app.post("/assigntask/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const { workerId, assignedDate, assignedTime } = req.body;

  try {
      const token = req.headers.token;
      if (!token) {
          return res.status(403).json({ status: "Unauthorized" });
      }

      jwt.verify(token, "waste_mngmt", async (error, decoded) => {
          if (error) {
              return res.status(401).json({ status: "Invalid Token" });
          }

          // Fetch worker details and assign the worker to the request
          const worker = await collectModel.findById(workerId).select("first_name last_name");
          const updatedRequest = await wastepickupModel.findByIdAndUpdate(
              requestId,
              { assignedWorker: workerId, assignedDate, assignedTime },
              { new: true }
          ).populate("userId", "first_name last_name");

          if (!updatedRequest) {
              return res.status(404).json({ status: "Request Not Found" });
          }

          return res.json({ status: "Worker Assigned Successfully", data: updatedRequest });
      });
  } catch (error) {
      console.error("Error assigning worker:", error);
      return res.status(500).json({ status: "Error assigning worker", error: error.message });
  }
});


// //----------------------------------------------------------------VIEW REQUEST END-------------------------------------------------------------

//----------------------------------------------------------------VIEW TASK BEGIN-------------------------------------------------------------




//----------------------------------------------------------------VIEW TASK END-------------------------------------------------------------




















































//----------------------------------------------------------------VIEW PAYMENT BEGIN-------------------------------------------------------------

//View Transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await transactionModel.find().populate("userId"); // Populate user details if needed
    res.status(200).json(transactions); // Return the transactions
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ status: "Error", error: error.message });
  }
});

//----------------------------------------------------------------VIEW PAYMENT END-------------------------------------------------------------

//----------------------------------------------------------------VIEW FEEDBACK BEGIN----------------------------------------------------------

// ViewFeedback API
app.post("/viewfeedback", async (req, res) => {
  let token = req.headers.token;
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (decoded && decoded.username) {
      try {
        const feedbackItems = await userfeedbackModel.find().lean();
        const feedbackWithEmails = await Promise.all(
          feedbackItems.map(async (item) => {
            const user = await userModel.findById(item.userId).select("email");
            return {
              ...item,
              email: user ? user.email : "Unknown", // Default to 'Unknown' if email is not found
            };
          })
        );
        res.json(feedbackWithEmails);
      } catch (error) {
        console.error("Error retrieving feedback", error);
        res.json({ status: "Error" });
      }
    } else {
      res.json({ status: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------VIEW FEEDBACK END----------------------------------------------------------

//----------------------------------------------------------------ADMIN END--------------------------------------------------------------------
























































//----------------------------------------------------------------USER SIGNUP & SIGNIN BEGIN--------------------------------------------------------------------

// User SignUp API
app.post("/signup", async (req, res) => {
  let input = req.body;

  try {
    // Hash the password
    const hashedPassword = Bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    // Checking if the same email exists
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ status: "Email ID already exists" });
    }

    // Geocode the address to get latitude and longitude
    const address = req.body.address;
    const geocodeResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          format: "json",
          q: address,
        },
      }
    );

    if (geocodeResponse.data.length > 0) {
      const location = geocodeResponse.data[0];
      const newUser = new userModel({
        ...input,
        latitude: location.lat, // Add latitude
        longitude: location.lon, // Add longitude
      });

      await newUser.save();
      return res.json({ status: "Success" });
    } else {
      return res.json({ status: "Address not found" });
    }
  } catch (error) {
    console.error("Error during signup:", error.message); // Log the error for debugging
    return res
      .status(500)
      .json({ status: "Error during sign up", error: error.message });
  }
});

//UserSignIn API
app.post("/signin", async (req, res) => {
  let input = req.body;
  let result = userModel
    .find({ email: req.body.email })
    .then((items) => {
      if (items.length > 0) {
        const passwordValidator = Bcrypt.compareSync(
          req.body.password,
          items[0].password
        );
        if (passwordValidator) {
          jwt.sign(
            { email: req.body.email },
            "waste_mngmt",
            { expiresIn: "1d" },
            (error, token) => {
              if (error) {
                res.json({ status: "Error", Error: error });
              } else {
                res.json({
                  status: "Success",
                  token: token,
                  userId: items[0]._id,
                });
              }
            }
          );
        } else {
          res.json({ status: "Incorrect Password" });
        }
      } else {
        res.json({ status: "Invalid Email ID" });
      }
    })
    .catch();
});



































//----------------------------------------------------------------USER SIGNUP & SIGNIN END--------------------------------------------------------------------

//----------------------------------------------------------------USER BEGIN--------------------------------------------------------------------

//----------------------------------------------------------------WASTE PICKUP REQUEST BEGIN--------------------------------------------------------------------

// Add WasteRequest API
app.post("/addrequest", async (req, res) => {
  let token = req.headers.token;

  // Verify token
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (error) {
      return res.json({ status: "Invalid Token" });
    }

    // Ensure the decoded token has the user's email
    if (decoded && decoded.email) {
      // Find the user using the decoded email
      const user = await userModel.findOne({ email: decoded.email });

      if (user) {
        // Create a new waste pickup request with userId
        let pickupRequest = new wastepickupModel({
          userId: user._id, // Attach userId to the request
          // No need to include address as it will be fetched automatically in the model
        });

        // Save the pickup request
        await pickupRequest.save();

        return res.json({
          status: "Success",
          requestId: pickupRequest.pickupId,
        }); // Optionally return the pickupId
      } else {
        return res.json({ status: "User Not Found" });
      }
    } else {
      return res.json({ status: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------WASTE PICKUP REQUEST END--------------------------------------------------------------------

//----------------------------------------------------------------TRANSACTION BEGIN--------------------------------------------------------------------

//Transaction API
app.post("/api/transactions", async (req, res) => {
  let token = req.headers.token;

  // Verify token
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (error) {
      return res.status(401).json({ status: "Invalid Token" });
    }

    if (decoded && decoded.email) {
      const user = await userModel.findOne({ email: decoded.email });

      if (user) {
        const { amount, description, month } = req.body; // Extract month from req.body

        try {
          const newTransaction = new transactionModel({
            userId: user._id,
            amount,
            description,
            month, // Add month to the new transaction
          });
          const savedTransaction = await newTransaction.save();
          res
            .status(201)
            .json({ status: "Success", transaction: savedTransaction });
        } catch (error) {
          console.error("Error creating transaction:", error);
          res.status(500).json({ status: "Error", error: error.message }); // Send error message to frontend
        }
      } else {
        return res.status(404).json({ status: "User Not Found" });
      }
    } else {
      return res.status(401).json({ status: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------TRANSACTION END--------------------------------------------------------------------

//----------------------------------------------------------------INVOICE BEGIN--------------------------------------------------------------------

app.get("/api/invoices", async (req, res) => {
  const token = req.headers.token;

  // Verify token
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    if (decoded && decoded.email) {
      // Find the user using the decoded email
      const user = await userModel.findOne({ email: decoded.email });

      if (user) {
        try {
          const invoices = await transactionModel
            .find({ userId: user._id })
            .populate("userId", "first_name last_name") // Populate user details
            .exec();

          res.json(invoices);
        } catch (error) {
          res.status(500).json({ message: "Error retrieving invoices", error });
        }
      } else {
        return res.status(404).json({ message: "User Not Found" });
      }
    } else {
      return res.status(401).json({ message: "Invalid Authentication" });
    }
  });
});

//----------------------------------------------------------------INVOICE END--------------------------------------------------------------------

//----------------------------------------------------------------FEEDBACK BEGIN--------------------------------------------------------------------

//UserFeedback API
app.post("/userfeedback", async (req, res) => {
  let input = req.body;
  let token = req.headers.token;

  //verify token
  jwt.verify(token, "waste_mngmt", async (error, decoded) => {
    if (decoded && decoded.email) {
      const user = await userModel.findOne({ username: decoded.username });
      if (user) {
        input.userId = user._id;
        input.email = user.email;
        let result = new userfeedbackModel(input);
        await result.save();
        res.json({ status: "Success" });
      } else {
        res.json({ status: "Invalid Authentication" });
      }
    }
  });
});

//----------------------------------------------------------------FEEDBACK END--------------------------------------------------------------------


//----------------------------------------------------------------USER END--------------------------------------------------------------------




//----------------------------------------------------------------COLLECTOR SIGNUP & SIGNIN BEGIN--------------------------------------------------------------------

//WasteCollectorSignUp API
app.post("/collectsignup", (req, res) => {
  let input = req.body;
  let hashedPassword = Bcrypt.hashSync(input.password, 10);
  input.password = hashedPassword;
  //console.log(input)
  let result = new collectModel(input);
  result.save();
  res.json({ status: "Success" });
});

//WasteCollectorSignIn API
app.post("/collectsignin", async (req, res) => {
  let input = req.body;
  let result = collectModel
    .find({ username: req.body.username })
    .then((items) => {
      if (items.length > 0) {
        const passwordValidator = Bcrypt.compareSync(
          req.body.password,
          items[0].password
        );
        if (passwordValidator) {
          jwt.sign(
            { username: req.body.username },
            "waste_mngmt",
            { expiresIn: "1d" },
            (error, token) => {
              if (error) {
                res.json({ status: "Error", Error: error });
              } else {
                res.json({
                  status: "Success",
                  token: token,
                  collectorId: items[0]._id,
                });
              }
            }
          );
        } else {
          res.json({ status: "Incorrect Password" });
        }
      } else {
        res.json({ status: "Invalid Username" });
      }
    })
    .catch();
});

//----------------------------------------------------------------COLLECTOR SIGNUP & SIGNIN END--------------------------------------------------------------------

//----------------------------------------------------------------VIEW TASKS BEGIN--------------------------------------------------------------------

app.get("/getWorkerTasks/:workerId", async (req, res) => {
  try {
      const { workerId } = req.params;

      // Find tasks assigned to the worker in the assigntaskModel collection
      const tasks = await assigntaskModel.find({ userId: workerId })
          .populate("pickupId")  // Populate pickupId to get requestId
          .populate("userId");  // Populate userId to get user's details

      if (!tasks || tasks.length === 0) {
          return res.status(404).json({ status: "No tasks found for this worker" });
      }

      // Format the response to include the task details
      const response = tasks.map((task) => ({
          pickupId: task.pickupId._id,   // Pickup ID
          requestId: task.pickupId.requestId,  // Request ID from pickupId
          assignedDate: task.date,        // Date the task was assigned
          
          
      }));

      // Send the response with task details
      res.json(response);
  } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ status: "Error fetching tasks", error: error.message });
  }
});

//----------------------------------------------------------------VIEW TASKS END--------------------------------------------------------------------

app.post("/completeTask/:pickupId", async (req, res) => {
  const { pickupId } = req.params;

  // Find the task using pickupId
  const task = await assigntaskModel.findOne({ pickupId });
  if (!task) {
    return res.status(404).json({ status: "Task not found" });
  }

  // Move the task to CompletedTask and delete from AssignTask
  await CompletedTaskModel.create({
    userId: task.userId,
    pickupId: task.pickupId,
    date: task.date
  });

  await assigntaskModel.findOneAndDelete({ pickupId });

  res.json({ status: "Task completed successfully", pickupId });
});



















app.listen(8080, () => {
  console.log("server started");
});
