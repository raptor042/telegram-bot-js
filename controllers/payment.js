import axios from "axios"

export const init_payment = async (secret, params) => {
    try {
        const response = await axios.post("https://api.paystack.co/transaction/initialize", params,
            {
                headers : {
                    "Authorization" : `Bearer ${secret}`,
                    "Content-Type" : "application/json"
                }
            }
        )
        console.log(response.data)

        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const verify_payment = async (secret, ref) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${ref}`,
            {
                headers : {
                    "Authorization" : `Bearer ${secret}`
                }
            }
        )
        console.log(response.data)

        return response.data
    } catch (error) {
        console.log(error)
    }
}