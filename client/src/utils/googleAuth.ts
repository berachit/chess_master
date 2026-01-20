export interface GoogleUser{
    name: string,
    email:string,
    picture:string
}

export function decodeGoogleCredential(
    credential: string
): GoogleUser{
    const payload = JSON.parse(
        atob(credential.split(".")[1])
    );

    return{
        name:payload.name,
        email:payload.email,
        picture:payload.picture
    }

}