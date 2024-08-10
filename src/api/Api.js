import axios from "axios"


export const FetchProducts = async () => {
    const Response =await axios.get("http://localhost:5000/products");
    return Response.data ;
}