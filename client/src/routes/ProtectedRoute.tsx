// allow user to open dashboard, profile, etc., only when they have logged in or signed up

import { useAppSelector } from "@/store/hooks"
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const { isAuthenticated, isHydrating } = useAppSelector(state => state.auth);

    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
            </div>
        );
    }

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }
    return <Outlet/>;
}
export default ProtectedRoute;