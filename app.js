const Express = require("express");
const Mongoose = require("mongoose");
const Cors = require("cors");
const jwt = require("jsonwebtoken");
const Bcrypt = require("bcrypt");
const userModel = require("./models/Users");
const adminModel = require("./models/Admin");

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

app.listen(8080, () => {
  console.log("server started");
});
