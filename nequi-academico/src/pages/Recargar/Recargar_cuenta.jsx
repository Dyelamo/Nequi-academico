import { useStoreUsuarios } from "../../supabase/storeUsuarios"
import { useStoreRecargaCuenta } from "../../supabase/storeRecargaCuenta"
import { useState, useEffect } from "react"
import "../../styles/recargar_cuenta.css"
import { useNavigate } from "react-router-dom"



const Recargar_cuenta = () => {

    const { currentUsuario } = useStoreUsuarios();
    const { crearRecarga } = useStoreRecargaCuenta();
    const [monto, setMonto] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const handleRecarga = async () => {
        if (!monto || isNaN(monto)) return alert("Ingrese un monto válido");
        await crearRecarga({
        id_cuenta: currentUsuario.id_cuenta,
        monto: parseFloat(monto),
        descripcion,
        });
        setMonto("");
        setDescripcion("");
    };

    const navigate = useNavigate();



    return (
        <div className="recargar-cuenta">

            <button className="btn-volver" onClick={() => navigate("/dashboard")}>
                ←
            </button>

        <h2>Recargar cuenta</h2>

        {/* Formulario de recarga */}
        <div className="form-recarga">
            <input
            type="number"
            placeholder="Monto a recargar"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            />
            <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            />
            <button onClick={handleRecarga}>Recargar</button>
        </div>
        </div>
    );
}


export default Recargar_cuenta