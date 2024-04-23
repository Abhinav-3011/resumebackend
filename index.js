import express from "express";
import cors from "cors";
import pdf from "html-pdf";
import ejs from "ejs";
import mongoose from "mongoose"
import multer from "multer"

const app = express();
const pass = "Bhawishya11";
const collection_name = "admitcard";
const mongo = `mongodb+srv://Bhawishya:${pass}@cluster0.ehz40xr.mongodb.net/${collection_name}?retryWrites=true&w=majority`;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('view engine', 'ejs')
app.use("/image", express.static("image"));
let resdata;

app.get("/", (req, res) => {

    res.render("resume.ejs",{resdata}); // Assuming resume.ejs is in the views folder
});

const connect_to_data_base = async () =>
{
    await mongoose.connect(mongo, {
       
    
      });
}
connect_to_data_base()



// login schema

const loginschema = new mongoose.Schema({
    email: String,
    password:String
})

// register schema

const registerschema = new mongoose.Schema({
    firstName: String,
    fatherName: String,
    branchCode: String,
    email: String,
    gender: String,
    city: String,
    state: String,
    zip: String,
    rollno: String,
    mobile: String,
    password: String,
    institute: String,
    examinationCenter: String,
    image: String,
    allsubject: [String]
    
});
let b;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'image');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        const filename = uniqueSuffix+"-"+file.originalname;
      
        console.log(`./image/${filename}`)
        b =`./image/${filename}`; // Update resdata with the image path
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });


app.post("/register", upload.single('image'), async (req, res) => {
    resdata = req.body;
    // Update resdata.image with the uploaded image path
    resdata.image = b;

    try {
        const Product = mongoose.model("resumedata", registerschema);
        let savedata = new Product(resdata);
        let resp = await savedata.save();
        console.log(resp);
        res.send(true);
    } catch (error)
    {
      res.send(false)
    }
 

    
     // Send the image path back to the client
});






app.post("/login", async (req, res) => {
    
  

   
    let Product = mongoose.model ("resumedata", loginschema);
    
    let mongodbdata =await  Product.findOne({ email: req.body.data.email, password: req.body.data.password })
    console.log(mongodbdata)
    console.log(req.body.data)
    if (mongodbdata == null)
    {
        res.send("false")
    }
    else
    {
        if (req.body.email === mongodbdata.email && req.body.password === mongodbdata.password)
        {
            
             res.send(true)
        }
        else
        {
            res.send(false)
            }
        }
});

app.get("/download", (req, res) => {


    if (resdata.email.length <= 0 || resdata.password.length <= 0 || resdata.email.length <= 0) {
        res.send("please fill the all details");
    }
    else {
        ejs.renderFile('Views/resume.ejs', { resdata }, (err, html) => {
            if (err) {
                console.error('Error rendering EJS template:', err);
                res.status(500).send('Error rendering EJS template');
                return;
            }

            pdf.create(html).toBuffer((err, buffer) => {
                if (err) {
                    console.error('Error creating PDF:', err);
                    res.status(500).send('Error creating PDF');
                    return;
                }

                // Set response headers for PDF download
                res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
                res.setHeader('Content-Type', 'application/pdf');
                res.send(buffer);
            });
        });
    
    }
});

app.listen(8000, () => {
    console.log("running");
});
