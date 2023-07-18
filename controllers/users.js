import UserModel from "../db/models/users.js"

export const createUser = async (credentials) => {
    try {
        const id = await UserModel.estimatedDocumentCount()

        const user = new UserModel({
            _id : id + 1,
            ...credentials
        })

        const response = await user.save()

        return response
    } catch (error) {
        console.log(error)
    }
}