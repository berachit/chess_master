// if logged in or signed up, does not allow to go to /login or /signup 

import { useAppSelector } from "@/store/hooks"
import { Navigate, Outlet } from "react-router-dom";

const AuthRedirectRoute = () => {
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    if(isAuthenticated){
        return <Navigate to={"/"}/>
    }
    return <Outlet/>
}

export default AuthRedirectRoute;