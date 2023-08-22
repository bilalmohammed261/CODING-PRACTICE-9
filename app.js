const express = require("express");
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname,"/userData.db");
app.use(express.json());
//console.log(dbPath);

let dbObj = null;
const connectDbAndStartServer = async()=>{
try{
       dbObj =  await open({
        filename:dbPath,
        driver:sqlite3.Database
    });
        app.listen(3000, () => {
      console.log("Server is listening on http://localhost:3000/");
      //console.log(dBConnObj);
    });
    
}  

catch(e){
    console.log(`Error message :${e.message}`);
    process.exit(1);
}

};
connectDbAndStartServer();

//API 1
app.post("/register/",async(request,response)=>{
    const {username,name,password,gender,location} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
   const selectUserQuery = `SELECT *FROM user
    WHERE username = '${username}';`;
    const dbResult = await dbObj.get(selectUserQuery);
    //console.log(dbResult);
    if(dbResult===undefined){
        const addUserQuery = `INSERT INTO 
        user(username,name,password,gender,location) 
        VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
        if(password.length<5){
              response.status(400);
              response.send("Password is too short");         
        }
        else{
                 await dbObj.run(addUserQuery);
                response.send("User created successfully");            
        }
   
    }
    else{
        response.status(400);
        response.send("User already exists");
    }
});

//API 2
app.post("/login/",async(request,response)=>{
     const {username,password} = request.body;
        const selectUserQuery = `SELECT *FROM user
    WHERE username = '${username}';`;
    const dbResult = await dbObj.get(selectUserQuery);
     if(dbResult===undefined){
         response.status(400);
         response.send("Invalid user");
     }
     else{
         const isPasswordSame = await bcrypt.compare(password,dbResult.password);
         if(isPasswordSame){
                     
         response.send("Login success!");
         }
         else{
         response.status(400);
         response.send("Invalid password");
         }
     }

});

//API 3
app.put("/change-password/",async(request,response)=>{
   const {username,oldPassword,newPassword} = request.body;
    const selectUserQuery = `SELECT *FROM user
    WHERE username = '${username}';`;
    const dbResult = await dbObj.get(selectUserQuery);
    const newHashedPassword = await bcrypt.hash(newPassword,10);
    const isPasswordSame = await bcrypt.compare(oldPassword,dbResult.password); 
         if(isPasswordSame){
        if(newPassword.length<5){
            response.status(400);
            response.send("Password is too short");            
        
        } 
        else{
                       const updatePasswordQuery = `UPDATE user
           SET password = '${newHashedPassword}'
        WHERE username = '${username}';`;
    await  dbObj.run(updatePasswordQuery);     
    response.send("Password updated");  
        }

         }
             else{
                    response.status(400);
            response.send("Invalid current password");      
     }
});

module.exports = app;

