import {smsSend} from "../../sms/sms.js";

smsSend("16688171257","1234").then(res=>{
    console.log(res)
}).catch(err=>{
    console.error("err：",err)
})