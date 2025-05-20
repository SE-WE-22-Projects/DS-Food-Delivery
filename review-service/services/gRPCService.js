import deliveryClient from "../gRPC/deliveryClient.js";

const getDeliveryAsync = (request) => {
    return new Promise((resolve, reject) => {
        deliveryClient.GetDeliveryByOrderId(request, (err, delivery) => {
            if (err) return reject(err);
            resolve(order);
        })
    })
}

export default getDeliveryAsync;