import {supabase} from '../supabase/supabase.config.jsx'
import bcrypt from 'bcryptjs'
import {create} from 'zustand'

export const useStoreUsuarios = create((set) => ({
    error: null,
    errorUsuario: null,
    errorCuenta: null,
    loading: false,
    currentUsuario: null,
    usuarios: [],

    crearUsuario: async (nuevoUsuario) => {
        set({loading: true, error: null});

        try{
            const hashedPassword = await bcrypt.hash(nuevoUsuario.password, 10);
            const usuarioConHas = {
                ...nuevoUsuario,
                password: hashedPassword
            };

            const {data: usuarioInsertado, error:errorUsuario} = await supabase.from("USUARIO").insert(usuarioConHas).select().single();

            
            if(errorUsuario) throw errorUsuario;

            const nuevaCuenta = {
                cedula: usuarioInsertado.cedula,
                saldo:10000
            };

            const { error: errorCuenta } = await supabase
                .from("CUENTA")
                .insert(nuevaCuenta);
            if (errorCuenta) throw errorCuenta;
            // await useStoreUsuarios.getState().cargarUsuarios();
            set({loading: false, error: null});

        }catch (error){
            set({loading: false, error: error.message});
            console.error("Error al crear usuario:", error);
            throw new Error(error.message);

        }
    },

    // autenticarUsuario: async (cedula, password) =>  {
    //     set({loading: true, error: null});
    //     try{
    //         const {data, error} = await supabase.from("USUARIO").select().eq("cedula", cedula).single();

    //         if(error) throw error;
    //         const passwordValida = await bcrypt.compare(password, data.password);

    //         if(!passwordValida){
    //             throw new Error("Contraseña incorrecta");
    //         }else{
    //             set({currentUsuario: data, loading: false, error: null});
    //         }
    //     }catch(error){
    //         set({ error: error.message, loading: false });
    //         console.error("Error al autenticar el usuario:", error);
    //         throw new Error(error.message || "No se pudo autenticar el usuario");
    //     }
    // }

    autenticarUsuario: async (cedula, password) =>  {
        set({loading: true, error: null});
        try {
            // Traer usuario
            const { data: usuario, error: errorUsuario } = await supabase
                .from("USUARIO")
                .select("*, CUENTA(saldo)")
                .eq("cedula", cedula)
                .single();
            console.log("Datos del usuario obtenido:", usuario);
            if (errorUsuario) throw errorUsuario;

            const passwordValida = await bcrypt.compare(password, usuario.password);

            if (!passwordValida) {
                throw new Error("Contraseña incorrecta");
            } else {
                const usuarioConSaldo = {
                    ...usuario,
                    saldo: usuario.CUENTA?.[0].saldo ?? 0
                };
                delete usuarioConSaldo.CUENTA; // opcional, para limpiar la propiedad anidada
                set({ currentUsuario: usuarioConSaldo, loading: false, error: null });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Error al autenticar el usuario:", error);
            throw new Error(error.message || "No se pudo autenticar el usuario");
        }
    }

}))