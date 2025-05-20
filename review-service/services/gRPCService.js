const { deliveryClient } = require("../gRPC/deliveryClient")

const getDeliveryAsync = (request)=> {
    return new Promise((resolve,reject)=>{
        deliveryClient.GetDeliveryByOrderId(request,(err,delivery)=>{
            if (err) return reject(err);
            resolve(order);
        })
    })
}

module.exports = {
    getDeliveryAsync
}