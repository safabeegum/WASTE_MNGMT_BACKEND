const Express = require("express");
const Mongoose = require("mongoose");
const Cors = require("cors");
const jwt = require("jsonwebtoken");
const router = Express.Router();
const Bcrypt = require("bcrypt");
const userModel = require("./models/Users");
const adminModel = require("./models/Admin");
const collectModel = require("./models/Collector");
const addcollectorModel = require("./models/AddCollector");
const userfeedbackModel = require("./models/UserFeedback");
const wastepickupModel = require("./models/WastePickup");
const assigntaskModel = require("./models/AssignTask");

let app = Express();
app.use(Express.json());
app.use(Cors());

Mongoose.connect(
  "mongodb+srv://safabeegum:mongodb24@cluster0.pbzbbey.mongodb.net/waste_mngmt?retryWrites=true&w=majority&appName=Cluster0"
);


//AdminSignUp API
app.post("/adminsignup",(req,res)=>{
  let input = req.body
  let hashedPassword = Bcrypt.hashSync(input.password,10)
  input.password = hashedPassword
  //console.log(input)
  let result = new adminModel(input)
  result.save()
  res.json({ status: "Success" });
})

//AdminSignIn API
app.post("/adminsignin", async(req,res)=>{
  let input = req.body
  let result = adminModel.find({username:req.body.username}).then(
          (items)=>{
              if (items.length>0) 
              {
                  const passwordValidator = Bcrypt.compareSync(req.body.password, items[0].password)
                  if (passwordValidator) 
                  {
                      jwt.sign({username:req.body.username},"waste_mngmt",{expiresIn:"1d"},
                          (error,token)=>{
                              if (error) 
                              {
                                  res.json({"status":"Error","Error":error})
                              } 
                              else 
                              {
                                  res.json({ status: "Success","token":token,"adminId":items[0]._id });
                              }
                          })
                  } 
                  else 
                  {
                      res.json({"status":"Incorrect Password"})
                  }
              } 
              else 
              {
                  res.json({"status":"Invalid Username"})
              }
          }
  ).catch()
})

//AddCollector API
app.post("/addcollector",(req,res)=>{
    let input = req.body
    let token = req.headers.token

//verifying token is valid  (start)
    jwt.verify(token,"waste_mngmt",async(error,decoded)=>{
        if(decoded && decoded.username) {
                let result = new addcollectorModel(input)
                await result.save()
                res.json({"status":"Success"})
        }
        else{
            res.json({"status":"Invalid Authentication"})
        }
    })
//  (end)
})

//ViewCollector API
app.post("/viewcollector",(req,res)=>{
    let token = req.headers.token
    jwt.verify(token,"waste_mngmt",async(error,decoded)=>{
        if(decoded && decoded.username) {
            addcollectorModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                res.json({"status":"Error"})
            }
        )
        }else{
            res.json({"status":"Invalid Authentication"})
        }
    })
})

//ViewUser API
app.post("/viewuser",(req,res)=>{
    let token = req.headers.token
    jwt.verify(token,"waste_mngmt",async(error,decoded)=>{
        if(decoded && decoded.username) {
            userModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                res.json({"status":"Error"})
            }
        )
        }else{
            res.json({"status":"Invalid Authentication"})
        }
    })
})

//WasteCollectorSignUp API
app.post("/collectsignup",(req,res)=>{
  let input = req.body
  let hashedPassword = Bcrypt.hashSync(input.password,10)
  input.password = hashedPassword
  //console.log(input)
  let result = new collectModel(input)
  result.save()
  res.json({ status: "Success" });
})

//WasteCollectorSignIn API
app.post("/collectsignin", async(req,res)=>{
  let input = req.body
  let result = collectModel.find({username:req.body.username}).then(
          (items)=>{
              if (items.length>0) 
              {
                  const passwordValidator = Bcrypt.compareSync(req.body.password, items[0].password)
                  if (passwordValidator) 
                  {
                      jwt.sign({username:req.body.username},"waste_mngmt",{expiresIn:"1d"},
                          (error,token)=>{
                              if (error) 
                              {
                                  res.json({"status":"Error","Error":error})
                              } 
                              else 
                              {
                                  res.json({ status: "Success","token":token,"collectorId":items[0]._id });
                              }
                          })
                  } 
                  else 
                  {
                      res.json({"status":"Incorrect Password"})
                  }
              } 
              else 
              {
                  res.json({"status":"Invalid Username"})
              }
          }
  ).catch()
})


//UserSignIn API
app.post("/signin", async(req,res)=>{
    let input = req.body
    let result = userModel.find({email:req.body.email}).then(
            (items)=>{
                if (items.length>0) 
                {
                    const passwordValidator = Bcrypt.compareSync(req.body.password, items[0].password)
                    if (passwordValidator) 
                    {
                        jwt.sign({email:req.body.email},"waste_mngmt",{expiresIn:"1d"},
                            (error,token)=>{
                                if (error) 
                                {
                                    res.json({"status":"Error","Error":error})
                                } 
                                else 
                                {
                                    res.json({ status: "Success","token":token,"userId":items[0]._id });
                                }
                            })
                    } 
                    else 
                    {
                        res.json({"status":"Incorrect Password"})
                    }
                } 
                else 
                {
                    res.json({"status":"Invalid Email ID"})
                }
            }
    ).catch()
})


//UserSignUp API
app.post("/signup", async (req, res) => {
  let input = req.body;
  let hashedPassword = Bcrypt.hashSync(req.body.password, 10);
  console.log(hashedPassword);
  req.body.password = hashedPassword;
  console.log(input);

  //checking if same mail id exists
  userModel
    .find({ email: req.body.email })
    .then((items) => {
      if (items.length > 0) {
        res.json({ status: "Email ID already Exists" });
      } else {
        let result = new userModel(input);
        result.save();
        res.json({ status: "Success" });
      }
    })
    .catch((error) => {});
});



// Add WasteRequest API
app.post("/addrequest", async (req, res) => {
    let token = req.headers.token;

    // Verify token
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
        if (error) {
            return res.json({ "status": "Invalid Token" });
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

                return res.json({ "status": "Success", "requestId": pickupRequest.pickupId }); // Optionally return the pickupId
            } else {
                return res.json({ "status": "User Not Found" });
            }
        } else {
            return res.json({ "status": "Invalid Authentication" });
        }
    });
});

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



//View WasteRequest API
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
                        .select('email first_name last_name address');
                    
                    return {
                        ...item,
                        email: user ? user.email : 'Unknown',  // Default to 'Unknown' if not found
                        first_name: user ? user.first_name : 'Unknown', 
                        last_name: user ? user.last_name : 'Unknown', 
                        address: user ? user.address : 'Unknown',
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


// //AssignTask API       
// router.post('/assigntask/:pickupId/:userId', async (req, res) => {
//     console.log('Received request:', {
//       body: req.body,
//       params: req.params,
//       headers: req.headers
//     });
  
//     try {
//       const { pickupId, userId } = req.params;
//       const { name, date, status, addnote } = req.body;
  
//       if (!pickupId || !userId) {
//         return res.status(400).json({
//           status: 'Error',
//           message: 'Missing pickup ID or user ID'
//         });
//       }
  
//       const token = req.headers.token;
//       if (!token) {
//         return res.status(401).json({
//           status: 'Error',
//           message: 'Authentication token is missing'
//         });
//       }
  
//       // Verify the token
//       try {
//         const decoded = jwt.verify(token, "waste_mngmt");
//         if (!decoded) {
//           return res.status(401).json({
//             status: 'Error',
//             message: 'Invalid token'
//           });
//         }
//       } catch (tokenError) {
//         console.error('Token verification error:', tokenError);
//         return res.status(401).json({
//           status: 'Error',
//           message: 'Token verification failed'
//         });
//       }
  
//       // Validate required fields
//       if (!name || !date) {
//         return res.status(400).json({
//           status: 'Error',
//           message: 'Name and date are required fields'
//         });
//       }
  
//       // Check if pickup request exists
//       const pickupRequest = await wastepickupModel.findById(pickupId);
//       if (!pickupRequest) {
//         return res.status(404).json({
//           status: 'Error',
//           message: 'Pickup request not found'
//         });
//       }
  
//       // Create new task
//       const newTask = new assigntaskModel({
//         pickupId,
//         userId,
//         name,
//         date,
//         status: status || 'Pending',
//         addnote: addnote || ''
//       });
  
//       // Save the task
//       const savedTask = await newTask.save();
//       console.log('Task saved successfully:', savedTask);
  
//       return res.status(200).json({
//         status: 'Success',
//         message: 'Task successfully assigned',
//         task: savedTask
//       });
  
//     } catch (error) {
//       console.error('Server error:', error);
//       return res.status(500).json({
//         status: 'Error',
//         message: 'Internal server error: ' + error.message
//       });
//     }
//   });
  
//   module.exports = router;



// Get Requests
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

            const requests = await wastepickupModel.find()
                .populate("userId", "first_name last_name address");
            
            return res.json(requests);
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        return res.status(500).json({ status: "Error fetching requests", error: error.message });
    }
});

// Get Workers
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

// Assign Task
app.post("/assigntask/:requestId", async (req, res) => {
    const { requestId } = req.params;
    const { workerId, assignedDate, assignedTime } = req.body;

    console.log("Assign Task Request:", { requestId, workerId, assignedDate, assignedTime }); // Log the assignment details

    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(403).json({ status: "Unauthorized" });
        }

        jwt.verify(token, "waste_mngmt", async (error, decoded) => {
            if (error) {
                return res.status(401).json({ status: "Invalid Token" });
            }

            const updatedRequest = await wastepickupModel.findByIdAndUpdate(
                requestId,
                {
                    assignedWorker: workerId,
                    assignedDate: assignedDate,
                    assignedTime: assignedTime,
                },
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



//ViewTask API
app.post("/viewtask", async (req, res) => {
    let token = req.headers.token;
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
        if (decoded && decoded.username) {
            try {
                const requestItems = await assigntaskModel.find().lean();
                const pickuprequest = await Promise.all(requestItems.map(async (item) => {
                    // Fetch user details using the correct userId from assigntaskModel
                    const user1 = await assigntaskModel.findById(item.userId).select('email');
                    const user2 = await assigntaskModel.findById(item.userId).select('first_name');
                    const user3 = await assigntaskModel.findById(item.userId).select('address');

                    return {
                        ...item,
                        email: user1 ? user1.email : 'Unknown',
                        first_name: user2 ? user2.first_name : 'Unknown',
                        address: user3 ? user3.address : 'Unknown',
                    };
                }));
                res.json(pickuprequest);
            } catch (error) {
                console.error("Error retrieving Request", error);
                res.json({ "status": "Error" });
            }
        } else {
            res.json({ "status": "Invalid Authentication" });
        }
    });
});



//UserFeedback API
app.post("/userfeedback",async(req,res) => {
    let input = req.body
    
    //pass awt token and validate token, otherwise anyone could post 
    //either pass through body or through headers
    //through headers--->
    let token = req.headers.token
    
    //verify token
    jwt.verify(token,"waste_mngmt",async(error, decoded)=> {
        if (decoded && decoded.email) 
        {
            const user = await userModel.findOne({ username: decoded.username });
            if (user)
            {
                input.userId = user._id;
                input.email = user.email;
                let result = new userfeedbackModel(input)
                await result.save()
                res.json({"status":"Success"})
            } 
            else  
            {
            res.json({"status":"Invalid Authentication"})
        }
    }
    })
})



// ViewFeedback API
app.post("/viewfeedback", async (req, res) => {
    let token = req.headers.token;
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
        if (decoded && decoded.username) {
            try {
                const feedbackItems = await userfeedbackModel.find().lean();
                const feedbackWithEmails = await Promise.all(feedbackItems.map(async (item) => {
                    const user = await userModel.findById(item.userId).select('email');
                    return {
                        ...item,
                        email: user ? user.email : 'Unknown', // Default to 'Unknown' if email is not found
                    };
                }));
                res.json(feedbackWithEmails);
            } catch (error) {
                console.error("Error retrieving feedback", error);
                res.json({ "status": "Error" });
            }
        } else {
            res.json({ "status": "Invalid Authentication" });
        }
    });
});

//RequestTable
app.post("/requesttable", async (req, res) => {
    let token = req.headers.token;
    console.log("Token received:", token);
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
      if (error) {
        console.log("Token verification error:", error);
        return res.status(401).json({ status: "Invalid Authentication", message: error.message });
      }
      console.log("Decoded JWT:", decoded);
      try {
        const requestItems = await wastepickupModel.find().lean();
        const pickupRequests = await Promise.all(
          requestItems.map(async (item) => {
            const user = await userModel.findById(item.userId).select('email first_name last_name address');
            return { pickupId: item.pickupId, userId: item.userId, address: user?.address || 'Unknown', postedDate: item.postedDate };
          })
        );
        res.json(pickupRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ status: "Error", message: err.message });
      }
    });
});

  



// app.post("/requesttable/:id", async (req, res) => {
//     const { id } = req.params; // Get the ID from the URL

//     try {
//         const event = await formModel.findById(id); // Query the database for the specific event by ID
//         if (!event) {
//             return res.status(404).json({ message: "Event not found" }); // Return 404 if no event is found
//         }
//         res.json(event); // Send the specific event details as JSON
//     } catch (error) {
//         console.error("Error fetching event data by ID:", error);
//         res.status(500).json({ message: "Error fetching event data" }); // Send error message if something goes wrong
//     }
// });

app.listen(8080, () => {
  console.log("server started");
});
