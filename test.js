import bcrypt from "bcrypt";

try {
    const genPassHash = async (plainpass, round = 12)=> {
        const hashPass = await bcrypt.hash(plainpass)
        console.log(hashPass)
    }
} catch (error) {
    console.log(error);
}


genPassHash()