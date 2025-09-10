import { useStorePrestamos } from "../../supabase/storePrestamos";
import { useStoreUsuarios } from "../../supabase/storeUsuarios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/historial_transacciones.css"
import { useStoreRecargaCuenta } from "../../supabase/storeRecargaCuenta";

const HistorialPrestamos = () => {

    const { currentUsuario } = useStoreUsuarios();
    const {obtenerPrestamosPorUsuario} = useStorePrestamos();
    const [prestamos, setPrestamos] = useState([]);
    const [selectedPrestamo, setSelectedPrestamo] = useState(null);
    const {obtenerTransaccionesPorUsuario} = useStoreRecargaCuenta();
    const [transacciones, setTransacciones] = useState([]);


    //CARGAR PRESTAMOS
    useEffect(() => {
        if(currentUsuario?.id_cuenta){
            (async () => {
                const data = await obtenerPrestamosPorUsuario(currentUsuario.id_cuenta);
                setPrestamos(data || []);
            })();
        }
    }, [currentUsuario]);

    useEffect(() => {
        if (currentUsuario?.id_cuenta) {
        (async () => {
            const data = await obtenerTransaccionesPorUsuario(currentUsuario.id_cuenta);
            setTransacciones(data || []);
        })();
        }
    }, [currentUsuario]);

    const navigate = useNavigate();



    return (
        <div className="historial-prestamos">
        <button className="btn-volver" onClick={() => navigate("/dashboard")}>
            ←
        </button>

        <h2>Historial de Préstamos</h2>

        <div className="prestamos-lista">
            {prestamos.map((p) => (
            <div
                key={p.id_prestamo}
                className="prestamo-card"
                onClick={() => setSelectedPrestamo(p)}
            >
                <p>
                <strong>Monto:</strong> {p.monto}
                </p>
                <p>
                <strong>Estado:</strong> {p.estado}
                </p>
                <p>
                <strong>Fecha solicitud:</strong> {p.fecha_solicitud}
                </p>
            </div>
            ))}
        </div>

        {selectedPrestamo && (
            <div className="cuotas-lista">
            <h3>Cuotas del préstamo #{selectedPrestamo.id_prestamo}</h3>
            <table>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Fecha vencimiento</th>
                    <th>Cuota</th>
                    <th>Interés</th>
                    <th>Capital</th>
                    <th>Estado</th>
                </tr>
                </thead>
                <tbody>
                {selectedPrestamo.CUOTAS.map((c) => (
                    <tr key={c.id_cuota}>
                    <td>{c.numero_cuota}</td>
                    <td>{c.fecha_vencimiento}</td>
                    <td>{c.monto_cuota}</td>
                    <td>{c.monto_interes}</td>
                    <td>{c.monto_capital}</td>
                    <td>{c.estado}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        {/* 🔹 Bloque de transacciones (recargas, retiros, pagos) */}
        <div className="transacciones-lista">
            <h2>Historial de Transacciones</h2>
            <table>
            <thead>
                <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                {transacciones.map((t, index) => (
                <tr key={t.id_transaccion}>
                    <td>{index + 1}</td>
                    <td>{t.tipo_transaccion}</td>
                    <td>{t.monto}</td>
                    <td>{t.descripcion}</td>
                    <td>{new Date(t.fecha_transaccion).toLocaleDateString()}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
};

export default HistorialPrestamos