import { Schema, model } from "mongoose"

const UserSchema = new Schema({
    _id : {
        type : Number,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    wager : {
        type : Number,
        required : true,
        min : 10,
        max : 1000000000
    },
    state : {
        type : String,
        required : true
    }
})

const UserModel = model("User", UserSchema)

export default UserModel