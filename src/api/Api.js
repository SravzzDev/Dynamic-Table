import axios from "axios"


export const FetchProducts = async () => {
    const Response =await axios.get("https://jsonplaceholder.typicode.com/users");
    return Response.data ;
}