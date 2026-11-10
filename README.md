# INTU IMPORT · Portal del Importador

Aplicación full-stack del portal de importaciones Fulcomex / INTU IMPORT. El frontend
es una SPA en React 19 servida por Laravel 13 a través de Vite; la API REST usa
Laravel Sanctum y SQLite como base de datos.

## Stack

- **Backend:** Laravel 13, Sanctum, SQLite
- **Frontend:** React 19, React Router 7, Tailwind CSS 4, Vite 8
- **Autenticación:** tokens de Sanctum guardados en `localStorage`

## Requisitos

- PHP 8.3+
- Composer 2
- Node.js 22+ y npm

## Arranque

```powershell
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
```

Levanta ambos procesos en terminales separadas:

```powershell
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Abre <http://localhost:8000>.

Para producción genera los assets una vez:

```powershell
npm run build
```

## Credenciales demo

| Usuario | Correo | Contraseña |
| --- | --- | --- |
| Usuario Demo | `demo@intuimport.bo` | `password` |
| Carlos Mendoza | `carlos@intuimport.bo` | `password` |
| Administrador | `admin@intuimport.bo` | `password` |

El administrador accede al panel en `http://localhost:8000/admin` para gestionar el
contenido del portal y las suscripciones de los importadores (suspender cuentas o
definir la fecha límite de suscripción).

## Módulos

Dashboard, Cursos, Grabaciones, Herramientas (calculadora de importación, CBM,
aranceles NANDINA y factura), Biblioteca, Mis importaciones, Proveedores, Productos,
Sugerencias, Contactos, Comunidad, Servicios, Oficina y Mi cuenta.

## API

Todas las rutas (excepto `register` y `login`) requieren `Authorization: Bearer <token>`.
El contrato completo está en `routes/api.php`.

## Notas

- La calculadora persiste su estado en `localStorage` (`fulcomex_calculator_v1`).
- El token se guarda en `localStorage` (`fulcomex_token`); ante un `401` se emite el
  evento `fulcomex:unauthorized` y la sesión se cierra.
- Los importadores con cuenta suspendida o suscripción vencida son bloqueados por el
  middleware `account.active`.
