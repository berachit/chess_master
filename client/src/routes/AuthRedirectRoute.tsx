// if logged in or signed up, does not allow to go to /login or /signup 

import { useAppSelector } from "@/store/hooks"
import { Navigate, Outlet } from "react-router-dom";

const AuthRedirectRoute = () => {
    const { isAuthenticated, isHydrating } = useAppSelector(state => state.auth);

    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
            </div>
        );
    }

    if(isAuthenticated){
        return <Navigate to={"/"}/>
    }
    return <Outlet/>
}

export default AuthRedirectRoute;