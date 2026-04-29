# 🚀 GUÍA COMPLETA - Conectar MisFinanzas a Supabase

## Paso 1: Obtener Credenciales de Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Abre tu proyecto (o crea uno nuevo)
4. Ve a **Settings → API**
5. Copia y guarda:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Key** → `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Mantén secreto

## Paso 2: Configurar .env

Edita el archivo `.env` en la raíz del proyecto y reemplaza con tus credenciales:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NODE_ENV=development
PORT=3000
SESSION_SECRET=MisFinanzasSecret2026
```

## Paso 3: Crear las Tablas en Supabase

1. En Supabase Dashboard, ve a **SQL Editor**
2. Copia TODO el contenido de `database/schema-CORREGIDO.sql`
3. Pégalo en el SQL Editor
4. Haz clic en **Run** (ejecutar)
5. Espera a que termine (debe decir "Success")

## Paso 4: Instalar Dependencias

En la terminal, ejecuta:

```bash
npm install
```

Esto instalará:
- `@supabase/supabase-js` - Cliente de Supabase
- `dotenv` - Gestión de variables de entorno
- Y las demás dependencias necesarias

## Paso 5: Reemplazar server.js

La versión actual usa SQLite. Tienes dos opciones:

### Opción A: Renombrar el nuevo (RECOMENDADO)
```bash
# Respalda el antiguo
mv server.js server-sqlite.js

# Usa el nuevo
mv server-supabase.js server.js
```

### Opción B: Editar manualmente
Si prefieres mantener tu server.js, reemplaza estas líneas:

**De esto:**
```javascript
const db = require('./db');
```

**A esto:**
```javascript
const {
  supabase,
  getUserByEmail,
  getUserById,
  registerUser,
  updateUserProfile,
  getUserTransactions,
  createTransaction,
  getDashboardSummary,
  getUserCategories,
  createCategory,
  getUserSavingsGoals,
  createSavingsGoal,
  getRecurringTransactions,
  createRecurringTransaction
} = require('./database/supabase-client');
```

Y luego adapta todas las rutas (ver ejemplos en `server-supabase.js`)

## Paso 6: Iniciar el Servidor

```bash
npm start
```

Deberías ver:
```
🚀 Servidor MisFinanzas ejecutándose en puerto 3000
📊 Base de datos: Supabase PostgreSQL
🔐 Autenticación: bcrypt + Session
```

## Paso 7: Probar Conexión

### Test 1: Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 2: Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 3: Obtener dashboard
```bash
curl -X GET http://localhost:3000/api/summary
```

## Problemas Comunes

### ❌ "Error: SUPABASE_URL is not defined"
**Solución:** Verifica que `.env` está en la raíz y tiene las credenciales

### ❌ "Error: Failed to connect"
**Solución:** Verifica que las credenciales en `.env` son correctas

### ❌ "No rows returned"
**Solución:** 
1. Verifica que el schema se ejecutó correctamente en Supabase
2. Intenta insertar datos de prueba
3. Verifica las RLS policies en Supabase

### ❌ "auth.uid() returns NULL"
**Solución:** Las RLS policies requieren Supabase Auth. Para desarrollo, puedes comentarlas en el schema

## Estructura de Archivos

```
MisFinanzas/
├── .env                          (NUEVO - Credenciales)
├── package.json                  (ACTUALIZADO - Con Supabase)
├── server.js                     (O server-supabase.js)
├── database/
│   ├── schema-CORREGIDO.sql     (Schema PostgreSQL)
│   ├── seed_data.sql            (Datos de prueba)
│   └── supabase-client.js       (Cliente Supabase)
├── public/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── ...
```

## Próximos Pasos

1. ✅ Conectar a Supabase
2. ✅ Crear tablas y índices
3. ⏳ Insertar datos de prueba (seed_data.sql)
4. ⏳ Implementar funciones PostgreSQL avanzadas
5. ⏳ Agregar autenticación con Supabase Auth

## Documentación Útil

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**¿Necesitas ayuda?** Proporciona tus credenciales de Supabase y completaremos la configuración automáticamente.
