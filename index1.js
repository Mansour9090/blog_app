// create express app

const express = require("express");

const mysql = require("mysql2");
const dbconnection = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"blog_app_5"
});
// check connection 
dbconnection.connect((error)=> {
   if(error) {
    return console.error(error.message);
     
   }
   return console.log("db connected successfully");
   
})
const app = express();

// bultin middleware json
app.use(express.json()) // next()
// register >> post >>  /register 
app.post("/register", (req, res, next) => {
    // get data from req
    const {fName, lName, email, password, dob} = req.body; // parse req
    // console.log({fName,lName, email, password, dob});
    // check user existence >> db >> dbconnection
    dbconnection.execute(`select * from users where email = "${email}" `,
        (error, result) => {
            if (error) {
                return res.status(500).json({message : "sersver  error", error});
            }
            // fail condition >> 
            if (result.length > 0) {
                return res.status(409).json({message : "user already exist"});
            }
            // add to db >> 
            dbconnection.execute(`
                insert into users 
                (f_name, l_name, email, password, dob) values
                ("${fName}", "${lName}", "${email}", "${password}", "${dob}")`,
                (error, result) => {
                    if (error) {
                        return res.status(500).json({message: "server error", error});
                    }
                    // fail condition 
                    if (result.affectedRows == 0) {
                        return res.status(500).json({message: " fail to create user"})
                    }
                    // send success response
                    return res.status(201).json({message: "user created successfully" });
                }
            )
        }
    )
});
// login >> post >> /login
app.post("/login", (req, res,next) => {
 // get data form req
 const { email, password} = req.body;
 console.log({ email, password});
 // check user exictence
 dbconnection.execute("SELECT * fom users where email = ? ",
 [email],
 (error, result) => {
    if (error) {
        return res.status(500).json({ message: "server error ", error});
    }
    // fail condition  >> check password
    if (result.length == 0 || result[0].password != password) {
        return res.status(401).json({ message: "invalid credentials"});
    }
    // send success response
    return res
    .status(200)
    .json({ message: "login successfully" , usersId:result[0].id});
 }   
 )
})
// add blog >> post >> /blog
app.post("/blog", (req, res,next)=> {
 //grt data from req
 const{ title, content, userId } = req.body;
 console.log({title, content, userId});
 // add blog to db 
 dbconnection.execute(
    "INSERT INTO blogs (title, content, u_Id) VALUES (? , ? , ? , ?)",
    [title, content, userId],
    (error, result) => {
        if (error) {
            return res.status(500).json({ message: "server error ", error});
        }
        if (result.affectedRows == 0 ) {
            return res.status(500).json({ message: "fail to create blog "});
        }
        // send success response
        return res.status(201).json({message: "blog created successfully"});
    }
 );
 
});
// delet blog >> delete >> /blog/id
app.delete("/blog/:id", (req, res,next) => {
 //get data from req
    const { id } = req.params;
    console.log({ id });
 //delete blog from db
    dbconnection.execute(
        "update blogs set is_deleted = 1 where id = ? AND is_deleted = 0 ",
        [id],
        (error, result) => {
            if (error) {
                return res.status(500).json({ message : " server error ", error});
            }
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "blog not found"});
            }
            return res.status(200).json({ message:"blog deleted successfully" });
            
        }
    );
});

// profile >> user data + blogs 
app.get("/profile/:id", (req, res,next) => {
  //get data from req 
  const { id } = req.params;
  //get data from db 
  let sql = `
  select 
  users.id as userId,blogs.id as blogId ,
  blogs.title, blogs.content,
  CONVERt(DATEDIFF(now(),dob) /365.25,INT) AS age,
  concat(f_name,' ',l_name) as userName
  from 
  users left join blogs
  on users.id = blogs.u_id
  where users.id = ? AND blogs.is_deleted = 0`;    
  let values = [ id ];
  dbconnection.execute(sql, values, (error, result) => {
    if (error) {
        return res.status(500).json({ message: " server error ", error})
    }
    return res.status(200).json({ message: "done", result})
  })
})

const port = 3000;
app.listen(port, () => {
    console.log("server is running on port" , port); 
    
    
});