//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

const uri = "mongodb+srv://yash1234:yash1234@cluster0.bxhpm.mongodb.net/todolistDB?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify:false}).then(()=>{
    console.log("Connecion successful");
}).catch((err)=>{console.log(err)})



const itemSchema = new mongoose.Schema({
  name : String
}) 




const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name : "Welcome to your todolist"
})

const item2  = new Item({
  name : "Hit the + button to add item"
})

const item3  = new Item({
  name: "Hit <-- to delete item"
})

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items : [itemSchema]
})

const List = mongoose.model("List",listSchema);





app.get("/", function(req, res) {
  Item.find({},(err,items)=>{
    
    if(items.length === 0){
      Item.insertMany(defaultItems,(err)=>{
        if(err){
          console.log("Error occured");
        }else{
          console.log("Added items to DB");
        }
      })

      res.redirect("/");
    }

      res.render("list", {listTitle: "Today", newListItems: items});
    
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},(err,foundOne)=>{
      foundOne.items.push(item);
      foundOne.save();
      res.redirect("/"+listName);
    })
  }

   
});

app.post("/delete",(req,res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: itemId},(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("removed");
      }
    });
    res.redirect("/");
  }else{
    
      
        // console.log(listName);
        // List.findOne({name:listName},(err,foundList)=>{
        //   const itemsList = foundList.items;
        //   itemsList.forEach(element => {

        //   });
          
        // })
        // // Item.deleteOne({_id: itemId},(err)=>{
        // //   if(err){
        // //     console.log(err);
        // //   }else{
        // //     console.log("removed");
        // //   }
        // // });
        // res.redirect("/"+listName);
      
    
    List.findOneAndUpdate({name : listName},{$pull:{items : {_id: itemId}}},function (err,foundList){
        if(!err){res.redirect("/"+ listName);}
        else{
          console.log(err);
        }
    });
  }

  
})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        const list =  new List({
          name : customListName,
          items: defaultItems 
        })
      
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
