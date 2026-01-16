import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const[user, setUser] = useState(null);

    // restores data after refresh
    useEffect(() => {
        const storedAuth = localStorage.getItem("auth");
        if(storedAuth){
            const auth = JSON.parse(storedAuth);
            setUser(auth.user);
        }
    },[])

    const login = (authData) => {
        localStorage.setItem("auth",JSON.stringify(authData));
        setUser(authData.user);
    }

    const logout = () => {
        localStorage.removeItem("auth");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

// custom hook so that we can use useAuth in place of useContext(AuthCOntext) which is easier
export const useAuth = useContext(AuthContext);