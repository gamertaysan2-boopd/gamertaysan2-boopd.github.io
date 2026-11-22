// Pega aquí la configuración de tu app web de Firebase
// (Consola de Firebase → Configuración del proyecto → Tus apps → App web → "Config").
// La apiKey de Firebase NO es un secreto: la seguridad la dan las reglas de
// Firestore (firestore.rules) y los dominios autorizados de Authentication.
export const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};
