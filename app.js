const express = require("express");

const bodyParser = require("body-parser")

// const Date = require(__dirname + "/date.js");

const mongoose = require("mongoose");

mongoose.pluralize(null);

const app = express();

const lodash = require("lodash");

// const items = ["Buy Food", "Cook Food", "Eat Food"];

const workItems = [];

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mihir:test123@cluster0.nnepz.mongodb.net/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const itemSchema = {
    name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    // name: "Welcome to your to-do list"
    name: "mihir"
});

const item2 = new Item({
    // name: "Hit the + button to add new item"
    name: "aditya"
});

const item3 = new Item({
    // name: "<-- Hit this to delete an item"
    name: "yoyo"
});

// const item4 = new Item({
//     name: "<-- mihir"
// });

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.get("/", function(req,res){
    Item.find({}, (err,foundItems)=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("inserted successfully");
                    res.redirect("/");
                }
            });
        }
        else{
            res.render("list", {listItem: "Today", newListItems: foundItems});
        }
        // console.log(foundItems);    
    });
    // const day = Date.getDate();
});

// app.get("/work", function(req,res){
//     res.render("list", {listItem: "Work List", newListItems: workItems});
// });

app.get("/:customListName", (req,res)=>{
    const customListName = lodash.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err,foundList)=>{
        if(!err){
            if(!foundList){
                console.log("Doesn't Exist");
                // creating new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save((err)=>{
                    res.redirect("/" + customListName);
                });
                // list.save().then(saved => {
                //     res.redirect("/" + customListName);
                // });
            }
            else{
                console.log("Exists");
                // showing the created list
                res.render("list", {listItem: foundList.name, newListItems: foundList.items});
            }
        }
    });

});

app.post("/", function(req,res){
    // if(req.body.list === "Work List"){
    //     workItems.push(req.body.newItem);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(req.body.newItem);
    //     res.redirect("/");
    // }
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save(err =>{
            res.redirect("/");
        });
        
    }
    else{
        List.findOne({name: listName}, (err,foundList)=>{
            foundList.items.push(item);
            foundList.save(err =>{
                res.redirect("/" + listName);
            });
        });
    }

});

app.post("/delete", (req,res)=>{
    // console.log(req.body);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.deleteOne({_id: checkedItemId}, (err)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err,foundList)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/" + listName);
            }
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("server has started successfully");
});
