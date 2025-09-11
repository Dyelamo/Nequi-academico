import {supabase} from '../supabase/supabase.config.jsx'
import {create} from 'zustand'
import { useStoreUsuarios } from './storeUsuarios.jsx';

export const useStorePrestamos = create((set) => ({
    error: null,
    loading: false,
    prestamos: [],
    cuotas: [],

    crearPrestamo: async (prestamo, cuotas = []) => {
        set({ loading: true, error: null });
        try {
        // 1. Insertar préstamo en la tabla PRESTAMO
            const { data: prestamoInsertado, error: errorPrestamo } = await supabase
                .from("PRESTAMOS")
                .insert(prestamo)
                .select()
                .single();

            console.log("Préstamo insertado:", prestamoInsertado);

        if (errorPrestamo) throw errorPrestamo;

        // 2. Insertar cuotas ligadas al préstamo
        if (cuotas.length > 0) {
            const cuotasConFk = cuotas.map((c) => ({
            ...c,
            id_prestamo: prestamoInsertado.id_prestamo, // 👈 FK
            }));

            const { error: errorCuotas } = await supabase
            .from("CUOTAS")
            .insert(cuotasConFk);

            if (errorCuotas) throw errorCuotas;
        }

        set((state) => ({
            loading: false,
            error: null,
            prestamos: [prestamoInsertado, ...state.prestamos],
        }));

        console.log("Préstamo y cuotas creados exitosamente", prestamoInsertado, cuotas);

        return prestamoInsertado;
        } catch (err) {
        console.error("Error al crear préstamo:", err);
        set({ loading: false, error: err.message });
        throw new Error(err.message);
        }
    },

    obtenerPrestamosPorUsuario: async (id_cuenta) => {
        set({ loading: true, error: null });
        try {
            // 1. Traer préstamos junto con sus cuotas relacionadas
            const { data: prestamos, error } = await supabase
                .from("PRESTAMOS")
                .select(`
                    id_prestamo,
                    monto,
                    tasa_interes,
                    plazo_meses,
                    plazo_años,
                    plazo_dias,
                    tipo_prestamo,
                    estado,
                    fecha_solicitud,
                    CUOTAS (
                        id_cuota,
                        numero_cuota,
                        fecha_vencimiento,
                        monto_cuota,
                        monto_interes,
                        monto_capital,
                        estado
                    )
                `)
                .eq("id_cuenta", id_cuenta)
                .order("fecha_solicitud", { ascending: false });

            if (error) throw error;

            set({ loading: false, prestamos, error: null });
            console.log("Préstamos obtenidos:", prestamos);
            return prestamos;
        } catch (err) {
            console.error("Error al obtener préstamos:", err);
            set({ loading: false, error: err.message });
            throw new Error(err.message);
        }
    },

    pagarCuotaActualizarEstado: async (id_cuota, id_cuenta) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase.rpc("pagar_cuota", {
                cuota_id: id_cuota,
                cuenta_id: id_cuenta,
            });

            if (error) throw error;
            const { fetchUsuario } = useStoreUsuarios.getState();
            await fetchUsuario(id_cuenta);

            set({ loading: false });
            console.log("✅ Cuota pagada correctamente");
            return true;
        } catch (err) {
            console.error("❌ Error al pagar cuota:", err);
            set({ loading: false, error: err.message });
            throw new Error(err.message);
        }
    }




    }));
