const mongoose  = require("mongoose")

const dbname = "taskapp";
mongoose.connect(
    `mongodb+srv://pushprajtaskapp:Pushprajtaskapp@cluster0.kgsyqbi.mongodb.net/${dbname}?retryWrites=true&w=majority`
);


