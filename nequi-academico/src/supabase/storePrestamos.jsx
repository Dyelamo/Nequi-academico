import {supabase} from '../supabase/supabase.config.jsx'
import {create} from 'zustand'

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

    visualizarPrestamos: async () => {

    },

    actualiarSaldoCuenta: async (id_cuenta, nuevoSaldo) => {
        
    }
    }));
