const express = require("express");
const app = express();
const path = require("path"); 

const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const {listingSchema} = require("./schema.js");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";

app.use(methodOverride("_method"))
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")))
async function main(){
    await mongoose.connect(mongoURL);
}

main().then(()=>{
    console.log("Connected to MDB");
})
.catch((err)=>{
    console.log(err);
})

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error)
    }
    else{
        next();
    }
}
// app.get("/testListing",async(req,res)=>{
    
//     await sampleListing.save();
//     console.log("Sample was saved")
//     res.send("Successfull test");
// })
app.get("/listing",wrapAsync(async(req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("./listing/index.ejs",{allListings});
}));

app.post("/listing",validateListing,wrapAsync((req,res)=>{
    // let newListing = new Listing(req.body);
    
    // console.log(req.body.listing);
    console.log(req.body)
    // if(!req.body ){
    //     throw new ExpressError(400,"Send complete Data")
    // }
    // let outcome = listingSchema.validate(req.body);
    // if(outcome.error){
    //     throw new ExpressError(400,outcome.error)
    // }
    // await newListing.save();

    let {title,description,image,price,location,country}= req.body; 
    let myListing = new Listing({
        title:title,
        description:description,
        image:image,
        price:price,
        location:location,
        country:country,
    }); 
    myListing.save()
    .then((res)=>{
        console.log("Data saved");
    })
    .catch((err)=>{
        console.log("Error to save: ",err)
    });
    res.redirect('/listing'); 

}));

app.put("/listing/:id",validateListing,wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body});
    
    res.redirect("/listing");
}));

app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id); 
    res.redirect("/listing");
}));

app.get("/listing/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs",{listing});
    // console.log(listing);

}));

app.get("/listing/new",(req,res)=>{
    // res.send("Request received")

    res.render("./listing/new.ejs");
});

app.get("/",(req,res)=>{
    // console.log()
    
    res.send("This is the root Directory...")
});

app.get("/listing/:id",wrapAsync(async(req,res)=>{
    // console.log()
    let {id} = req.params;
    const listing = await Listing.findById(id);
    // console.log(id);
    // let data = a wait Listing.findById(id);
    res.render("./listing/show.ejs",{listing});
    // console.log(data);
}));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!!"))
});

app.use((err,req,res,next)=>{
    let {statusCode=500 ,message = "Some Error" } = err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message); 
});

app.listen(3000,()=>{
    console.log("Listening on Port 8080...");
});