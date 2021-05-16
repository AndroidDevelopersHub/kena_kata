const express = require("express");
const db = require("./db");
const router = express.Router();
let jwt = require("jsonwebtoken");
const config = require("../../middleware/config.json"); // refresh
let tokenChecker = require("../../middleware/tockenchecker");
const tokenList = {};
const _response = require('../common/middleware/api-response')
const responsemsg = require('../common/middleware/response-msg')
const responsecode = require('../common/middleware/response-code')
const response = require('../common/middleware/api-response')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt');
const commonServe = require('../common/services/commonServices')


module.exports = function (router) {
    router.get('/users', list);
    router.post('/users', add);
    router.put('/users/:id', update);
    router.get('/users/:id', details);
    router.delete('/users/:id', _delete);
}


const schema = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().min(11).required(),
    salt: Joi.string().required(),
    //token: Joi.string().required()
});

function add(req, res){
    //
    var salt =  bcrypt.hashSync(req.body.password.toString(),  bcrypt.genSaltSync(10));
    req.body.password = salt

   // const { error } = schema.validate(req.body);
   // if (error) return _response.apiFailed(res ,error.details[0].message)

    db.query("SELECT * FROM `users` WHERE email = '"+email+"' OR phone_number = '"+phone_number+"'", (err, result) =>{
        if (!result.length){
            console.log('User not exist')
            db.query("INSERT INTO users SET ?", req.body , (err, result) => {
                if (!err) {
                    return _response.apiSuccess(res, responsemsg.userSaveSuccess , result)
                } else {
                    return _response.apiFailed(res, err , result)
                }
            });

        }else {
            return _response.apiWarning(res, responsemsg.userAlreadyExist)
        }
    })



}

async function list(req ,res ){

    var limit = 500;
    var page = 1;
    var totalDocs = 0;
    if (req.query.page){
        page = req.query.page
    }
    if (req.query.limit){
        limit = req.query.limit
    }
    var offset = (page - 1) * limit


    db.query("SELECT COUNT(*) AS total FROM users", (err, result) => {
        if (!err) {
            totalDocs = result[0].total
        } else {

        }
    });



    //Search by String
    if (req.query.search_string && req.query.search_string !== ''){

        db.query("SELECT * FROM users WHERE CONCAT(username, email,phone_number) REGEXP '"+req.query.search_string+"'  LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.redeemFound , result,{page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.userListIsEmpty)
            }
        });


    }else {
        db.query("SELECT * FROM users LIMIT "+limit+" OFFSET "+offset+" ", (err, result) => {
            if (!err) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.userFound , result , {page: parseInt(page) , limit: parseInt(limit),totalDocs: totalDocs })

            } else {
                return _response.apiFailed(res, responsemsg.userListIsEmpty )
            }
        });
    }


}

function update(req ,res ){
    var formData = []

    if (req.params.id){
        db.query("SELECT * FROM `users` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {

                db.query("UPDATE users SET ? WHERE id = '"+req.params.id+"'" , req.body ,(err , result) =>{
                    if (!err){
                        return _response.apiSuccess(res, responsemsg.userUpdateSuccess)
                    }else{
                        return _response.apiFailed(res, err)
                    }
                })

            } else {
                return _response.apiFailed(res, err)
            }
        });

    }else {
        return  _response.apiWarning(res, 'Please select id.')

    }
}

function details(req ,res ){
    //const result = bcrypt.compareSync('123', hash);
    if (req.params.id){
        db.query("SELECT * FROM `users` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!err && result.length > 0) {
                return _response.apiSuccess(res, result.length+" "+responsemsg.userFound ,result)
            } else {
                return _response.apiWarning(res , responsemsg.userListIsEmpty)
            }
        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}

function _delete(req ,res){

    if (req.params.id){
        db.query("SELECT * FROM `users` WHERE id='"+req.params.id+"'", (err, result) => {
            if (!result.length){
                return _response.apiWarning(res, responsemsg.userListIsEmpty)
            }else {
                db.query("DELETE FROM `users` WHERE id='" + req.params.id + "'", (err, result) => {
                    if (!err) {
                        return _response.apiSuccess(res, responsemsg.userDeleteSuccess)
                    } else {
                        return _response.apiFailed(res, err)
                    }
                });
            }

        });
    }else {
        return _response.apiWarning(res , 'Please select id')
    }
}
