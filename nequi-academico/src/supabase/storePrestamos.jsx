import { supabase } from "./supabase.config";
import { create } from "zustand";



export const useStorePrestamos = create((set) => ({
    error: null,
    loading: false,
    prestamos: [],
    cuotas: [],

    crearPrestamo: async (prestamo, cuotas = []) => {
        set({ loading: true, error: null });
        try{
            const {data: prestamoInsertado, error: errorPrestamo} = await supabase.from("PRESTAMO").insert(prestamo).select().single();
            if(errorPrestamo) throw errorPrestamo;

            if(cuotas.length > 0){
                const cuotasCobFk = cuotas.map(c  => ({
                    ...c,
                    id_prestamo: prestamoInsertado.id_prestamo
                }))
                const { error: errorCuotas } = await supabase.from("CUOTA").insert(cuotasCobFk);
                if(errorCuotas) throw errorCuotas;
            }
            set({ loading: false, error: null });
            return prestamoInsertado;
        }catch (error){
            console.error("Error al crear préstamo:", err)
            set({ loading: false, error: err.message })
            throw new Error(err.message)
        }
    }
}))