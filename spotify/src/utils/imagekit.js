import { ImageKit} from "@imagekit/nodejs"
import dotenv from "dotenv";
dotenv.config();

const imageKitClient = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

async function uploadFile(file){
    const result = await imageKitClient.files.upload({
        file,
        fileName: "music_" + Date.now(),
        folder: "backend-project/spotify"
    })
    return result;
}

export {uploadFile}