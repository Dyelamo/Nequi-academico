import { useStoreUsuarios } from "../../supabase/storeUsuarios";
import { useEffect, useState } from "react";
import "../../styles/perfil.css"
import { useNavigate } from "react-router-dom";

const Perfil = () => {

    const navigate = useNavigate();
    const { currentUsuario, obtenerUsuarioConCuenta, loading, error } = useStoreUsuarios();
    const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        // 👇 Aquí puedes usar la cédula almacenada en localStorage, session o la que tengas
        const cedula = currentUsuario?.cedula;
        if (cedula) {
          const data = await obtenerUsuarioConCuenta(cedula);
          setUsuario(data);
        }
      } catch (err) {
        console.error("❌ Error cargando usuario:", err.message);
      }
    };

    fetchUsuario();
  }, [obtenerUsuarioConCuenta]);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (

    

    <div className="perfil">

        <button className="btn-volver" onClick={() => navigate("/dashboard")}>
                ←
        </button>

      <h2>Perfil del Usuario</h2>
      {usuario ? (
        <div className="perfil-info">
          <p>
            <strong>Nombre:</strong> {usuario.nombre}
          </p>
          <p>
            <strong>Cédula:</strong> {usuario.cedula}
          </p>
          <p>
            <strong>Correo:</strong> {usuario.correo}
          </p>
          <p>
            <strong>Teléfono:</strong> {usuario.telefono}
          </p>
          <p>
            <strong>ID Cuenta:</strong> {usuario.id_cuenta}
          </p>

        </div>
      ) : (
        <p>No se encontró información del usuario</p>
      )}
    </div>
  );
};

export default Perfil;
