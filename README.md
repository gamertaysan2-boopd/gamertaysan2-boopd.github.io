# Premium Apuestas — inicio de sesión con roles

Sitio estático (GitHub Pages) con registro e inicio de sesión usando **Firebase Authentication** + **Firestore**.
Roles: `usuario` (por defecto al registrarse), `moderador` y `admin`.

## Qué puede hacer cada rol

| Rol | Permisos |
|---|---|
| usuario | Iniciar sesión y confirmar apuestas. |
| moderador | Ver el panel de usuarios y bloquear/desbloquear a los `usuario`. |
| admin | Todo lo anterior + cambiar el rol de cualquiera y bloquear a cualquiera (menos a sí mismo). |

Los permisos los aplican las **reglas de Firestore** (`firestore.rules`), no el JavaScript del navegador.
Ocultar botones en pantalla es solo estética; lo que realmente protege es el servidor.

## Configuración (una sola vez)

1. Entra a https://console.firebase.google.com → **Agregar proyecto**.
2. **Configuración del proyecto → Tus apps → Web (</>)**: registra la app y copia el objeto `firebaseConfig` en `firebase-config.js`.
3. **Authentication → Método de acceso**: activa **Correo electrónico/contraseña**.
4. **Authentication → Configuración → Dominios autorizados**: agrega `TU_USUARIO.github.io`.
5. **Firestore Database → Crear base de datos** (modo producción). En la pestaña **Reglas**, pega el contenido de `firestore.rules` y publica.
6. **Primer admin**: regístrate en tu sitio, luego en Firestore abre `users → tu documento` y cambia el campo `role` de `usuario` a `admin` (la consola sí puede hacerlo). Desde ahí promueves a otros desde el **Panel** del sitio.

## Seguridad incluida

- Nadie puede registrarse como admin/moderador: las reglas obligan `role == "usuario"` al crear el perfil.
- Nadie puede cambiarse su propio rol; solo un admin cambia roles y no puede modificar el suyo (evita quedarte sin admin).
- El moderador solo puede tocar el campo `bloqueado` de usuarios normales.
- Mensajes de error genéricos en el login y en "olvidé mi contraseña" (no revelan qué correos existen).
- Los datos de usuarios se pintan con `textContent` (sin riesgo de inyección HTML/XSS).
- Contraseña mínima de 8 caracteres con letras y números; se envía correo de verificación al registrarse.

## Pendiente a futuro

El saldo y las apuestas siguen siendo una **demo en el navegador**: cualquiera podría manipularlos desde la consola.
Para dinero real hay que moverlos al servidor (por ejemplo, Cloud Functions + Firestore), nunca en el JavaScript del cliente.
