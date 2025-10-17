import { Navigate } from "react-router-dom";
import { useStoreUsuarios } from "../supabase/storeUsuarios";

const PrivateRoutes = ({ children }) => {
    const { currentUsuario } = useStoreUsuarios();

    if (!currentUsuario) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default PrivateRoutes;