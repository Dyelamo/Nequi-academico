import {supabase} from '../supabase/supabase.config.jsx'
import bcrypt from 'bcryptjs'
import {create} from 'zustand'

export const useStoreUsuarios = create((set) => ({
    error: null,
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

            const {error} = await supabase.from("USUARIO").insert(usuarioConHas);
            if(error) throw error;

            // await useStoreUsuarios.getState().cargarUsuarios();

            set({loading: false, error: null});

        }catch (error){
            set({loading: false, error: error.message});
            console.error("Error al crear usuario:", error);
            throw new Error(error.message);

        }
    },

    autenticarUsuario: async (cedula, password) =>  {
        set({loading: true, error: null});
        try{
            const {data, error} = await supabase.from("USUARIO").select().eq("cedula", cedula).single();

            if(error) throw error;
            const passwordValida = await bcrypt.compare(password, data.password);

            if(!passwordValida){
                throw new Error("Contraseña incorrecta");
            }else{
                set({currentUsuario: data, loading: false, error: null});
            }
        }catch(error){
            set({ error: error.message, loading: false });
            console.error("Error al autenticar el usuario:", error);
            throw new Error(error.message || "No se pudo autenticar el usuario");
        }
    }
}))