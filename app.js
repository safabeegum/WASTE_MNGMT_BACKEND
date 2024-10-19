const Express = require("express");
const Mongoose = require("mongoose");
const Cors = require("cors");
const jwt = require("jsonwebtoken");
const Bcrypt = require("bcrypt");
const userModel = require("./models/Users");
const adminModel = require("./models/Admin");
const collectModel = require("./models/Collector");
const addcollectorModel = require("./models/AddCollector");
const userfeedbackModel = require("./models/UserFeedback");
const wastepickupModel = require("./models/WastePickup");

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




//Add WasteRequest API
app.post("/addrequest",async(req,res) => {
    let input = req.body
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
                let result = new wastepickupModel(input)
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


//View WasteRequest API
app.post("/viewrequest", async (req, res) => {
    let token = req.headers.token;
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
        if (decoded && decoded.username) {
            try {
                const requestItems = await wastepickupModel.find().lean();
                const pickuprequest = await Promise.all(requestItems.map(async (item) => {
                    const user1 = await userModel.findById(item.userId).select('email');
                    const user2 = await userModel.findById(item.userId).select('first_name');
                    const user3 = await userModel.findById(item.userId).select('last_name');
                    const user4 = await userModel.findById(item.userId).select('address');
                    return {
                        ...item,
                        email: user1 ? user1.email : 'Unknown', // Default to 'Unknown' if email is not found
                        first_name: user2 ? user2.first_name : 'Unknown', // Default to 'Unknown' if first name is not found
                        last_name: user3 ? user3.last_name : 'Unknown', // Default to 'Unknown' if last name is not found
                        address: user4 ? user4.address : 'Unknown', // Default to 'Unknown' if address is not found
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


//RequestTable API
app.post("/requesttable", async (req, res) => {
    let token = req.headers.token;
    jwt.verify(token, "waste_mngmt", async (error, decoded) => {
        if (decoded && decoded.username) {
            try {
                const requestItems = await wastepickupModel.find().lean();
                const pickuprequest = await Promise.all(requestItems.map(async (item) => {
                    const user1 = await userModel.findById(item.userId).select('email');
                    const user2 = await userModel.findById(item.userId).select('first_name');
                    const user3 = await userModel.findById(item.userId).select('address');
                    const user4 = await wastepickupModel.findById(item.userId).select('quantity');
                    const user5 = await wastepickupModel.findById(item.userId).select('addinfo');
                    return {
                        ...item,
                        email: user1 ? user1.email : 'Unknown', // Default to 'Unknown' if email is not found
                        first_name: user2 ? user2.first_name : 'Unknown', // Default to 'Unknown' if first name is not found
                        address: user3 ? user3.address : 'Unknown', // Default to 'Unknown' if address is not found
                        quantity: user4 ? user4.quantity : 'Unknown', // Default to 'Unknown' if address is not found
                        addinfo: user5 ? user5.addinfo : 'Unknown', // Default to 'Unknown' if address is not found
                        postedDate: item.postedDate || 'Unknown'// Default to 'Unknown' if address is not found
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



app.listen(8080, () => {
  console.log("server started");
});
