import { supabase } from "./supabase.config";
import { create } from "zustand";
import { useStoreUsuarios } from "./storeUsuarios";

export const useStoreRecargaCuenta = create((set) => ({
    error: null,
    loading: false,
    recargas: [],

    

    crearRecarga: async (recarga) => {
        const { fetchUsuario } = useStoreUsuarios.getState(); // ✅ accede al método del otro store
        set({ loading: true, error: null });
        try {
        // 1. Insertar transacción (recarga)
        const { data: recargaInsertada, error } = await supabase
            .from("TRANSACCIONES")
            .insert({
            id_cuenta: recarga.id_cuenta,
            tipo_transsacion: "recarga",
            monto: recarga.monto,
            descripcion: recarga.descripcion || "Recarga de saldo",
            fecha_transaccion: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        console.log("✅ Recarga insertada:", recargaInsertada);

        // 2. Actualizar saldo de la cuenta
        const { error: errorSaldo } = await supabase.rpc("actualizar_saldo_cuenta_recarga", {
            cuenta_id: recarga.id_cuenta,
            monto_nuevo: recarga.monto,
        });

        if (errorSaldo) throw errorSaldo;

        set((state) => ({
            loading: false,
            recargas: [recargaInsertada, ...state.recargas],
        }));


        const usuarioActualizado = await fetchUsuario(recarga.id_cuenta);

        // return recargaInsertada;
        return {
            recarga: recargaInsertada,
            nuevoSaldo: usuarioActualizado.saldo,
        };

        } catch (err) {
        console.error("❌ Error al crear recarga:", err);
        set({ loading: false, error: err.message });
        throw err;
        }
    },
}))