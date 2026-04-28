# 🚀 Guía de Instalación y Configuración - Supabase

## 📋 Prerrequisitos

- Node.js v16 o superior
- npm o yarn
- Cuenta en Supabase (supabase.com)
- Git (opcional pero recomendado)

---

## 🔧 Paso 1: Crear Proyecto en Supabase

### 1.1 Registrarse en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project" (Comenzar tu proyecto)
3. Elige GitHub como proveedor de autenticación o crea una cuenta directamente

### 1.2 Crear Nueva Organización (Opcional)
- Si es tu primer proyecto, Supabase creará una organización por defecto
- Puedes cambiar el nombre later en Settings

### 1.3 Crear Nuevo Proyecto
1. Haz clic en "New Project" (Nuevo Proyecto)
2. Completa los datos:
   - **Name**: `MisFinanzas` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña fuerte
   - **Region**: Elige la región más cercana a ti (ej: Miami para América)
   - **Pricing Plan**: Comienza con Free (suficiente para desarrollo)

3. Espera a que se cree el proyecto (2-3 minutos)

---

## 📝 Paso 2: Obtener Credenciales de Supabase

### 2.1 Acceder al Dashboard del Proyecto
1. Desde el dashboard de Supabase, entra a tu proyecto
2. Dirígete a **Settings > API** en el panel izquierdo

### 2.2 Copiar las Claves
Aquí encontrarás:
- **Project URL**: `https://your-project.supabase.co`
- **anon (public) key**: Clave pública para el frontend
- **service_role (secret) key**: Clave secreta para el backend

⚠️ **IMPORTANTE**: Guarda estas claves en un lugar seguro. No las compartas públicamente.

---

## 🗄️ Paso 3: Crear la Estructura de Base de Datos

### 3.1 Acceder al SQL Editor
1. En el dashboard de Supabase, haz clic en **SQL Editor** (panel izquierdo)
2. Haz clic en **New Query** (Nueva Consulta)

### 3.2 Ejecutar Schema SQL
1. Abre el archivo `database/schema.sql` de tu proyecto
2. Copia TODO el contenido
3. Pega en la consulta SQL de Supabase
4. Haz clic en **Run** (Ejecutar)

✅ Esto creará:
- Todas las tablas
- Índices
- Funciones PostgreSQL
- Vistas
- Triggers
- Políticas de seguridad (RLS)

### 3.3 Ejecutar Datos de Prueba
1. Crea una nueva consulta
2. Abre `database/seed_data.sql`
3. Copia y ejecuta el contenido

✅ Esto insertará datos de ejemplo para probar

### 3.4 Ejecutar Funciones Útiles
1. Crea una nueva consulta
2. Abre `database/functions.sql`
3. Copia y ejecuta el contenido

✅ Ahora tienes funciones PostgreSQL para operaciones comunes

---

## 📦 Paso 4: Configurar tu Proyecto Node.js

### 4.1 Instalar Dependencias
```bash
cd MisFinanzas
npm install
```

### 4.2 Instalar Supabase Client
```bash
npm install @supabase/supabase-js
npm install dotenv
```

### 4.3 Crear Archivo `.env`
En la raíz del proyecto, crea archivo `.env`:

```env
# =====================
# Supabase Configuration
# =====================
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (clave pública)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (clave secreta)

# =====================
# Node.js Configuration
# =====================
NODE_ENV=development
PORT=3000
SESSION_SECRET=tu-secreto-super-secreto-aqui

# =====================
# Database Configuration (Opcional)
# =====================
DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
```

⚠️ **IMPORTANTE**: 
- Nunca commits `.env` a Git
- Añade `.env` a `.gitignore`

### 4.4 Crear `.gitignore` (si no existe)
```
node_modules/
.env
.env.local
.env.*.local
*.log
.DS_Store
```

---

## 🔄 Paso 5: Migrar Código Existente

### 5.1 Actualizar `db.js`
Reemplaza tu `db.js` existente con el nuevo `database/supabase-client.js`:

```javascript
// En tu server.js, cambia:
// const db = require('./db');
// Por:
const db = require('./database/supabase-client');
```

### 5.2 Actualizar Endpoints
Usa los ejemplos en `database/MIGRATION_EXAMPLES.js` para convertir tus endpoints:

**Antes (SQLite):**
```javascript
const rows = await runQuery('SELECT * FROM users WHERE email = ?', [email]);
```

**Después (Supabase):**
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
```

### 5.3 Cambios Importantes
1. **Formato de parámetros**: De `?` a objetos con nombres
2. **Resultados**: De arrays a objetos con `{ data, error }`
3. **Errores**: Manejo diferente de excepciones
4. **IDs**: De integers a UUIDs
5. **Timestamps**: Ya son automáticos con triggers

---

## ✅ Paso 6: Probar la Conexión

### 6.1 Crear Script de Prueba
Crea archivo `test-connection.js`:

```javascript
require('dotenv').config();
const { supabase } = require('./database/supabase-client');

async function testConnection() {
  try {
    console.log('🔌 Conectando a Supabase...');
    
    // Prueba 1: Consultar tabla users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) throw usersError;
    console.log('✅ Conexión exitosa a tabla "users"');
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    
    // Prueba 2: Consultar categorías
    const { data: categories, error: catError } = await supabase
      .from('transaction_categories')
      .select('*')
      .limit(5);
    
    if (catError) throw catError;
    console.log('✅ Conexión exitosa a tabla "transaction_categories"');
    console.log(`📊 Categorías encontradas: ${categories.length}`);
    
    // Prueba 3: Llamar función
    const { data: summary, error: sumError } = await supabase
      .rpc('get_dashboard_summary', {
        p_user_id: users[0]?.id
      });
    
    if (sumError) throw sumError;
    console.log('✅ Función PostgreSQL funcionando');
    console.log(`💰 Resumen: ${JSON.stringify(summary[0])}`);
    
    console.log('\n🎉 ¡Todas las pruebas pasaron!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testConnection();
```

### 6.2 Ejecutar Prueba
```bash
node test-connection.js
```

Deberías ver algo como:
```
🔌 Conectando a Supabase...
✅ Conexión exitosa a tabla "users"
📊 Usuarios encontrados: 1
✅ Conexión exitosa a tabla "transaction_categories"
📊 Categorías encontradas: 14
✅ Función PostgreSQL funcionando
💰 Resumen: {...}

🎉 ¡Todas las pruebas pasaron!
```

---

## 🚀 Paso 7: Iniciar la Aplicación

### 7.1 Instalar Dependencias Faltantes
```bash
npm install bcrypt cors express express-session xlsx
```

### 7.2 Actualizar `server.js`
Asegúrate de que está usando el nuevo cliente Supabase:

```javascript
// Inicio del archivo server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Nuevo cliente Supabase
const { supabase } = require('./database/supabase-client');

const app = express();
const port = process.env.PORT || 3000;

// ... resto del código
```

### 7.3 Ejecutar Servidor
```bash
npm start
```

O en desarrollo:
```bash
npm run dev
```

La aplicación debería iniciarse en `http://localhost:3000`

---

## 🔐 Paso 8: Configurar Autenticación

### 8.1 Hash de Contraseñas
El código ya usa bcrypt para hasher contraseñas. Verifica:

```javascript
// Registrar usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 8.2 Row Level Security (RLS)
Las políticas de RLS ya están en `schema.sql`. Verificar que están activas:

1. En Supabase, ve a **Authentication > Policies**
2. Verifica que cada tabla tenga políticas de seguridad

---

## 📊 Paso 9: Monitorear la Base de Datos

### 9.1 Ver Datos en Supabase
1. En el dashboard, ve a **Table Editor** (Editor de Tablas)
2. Selecciona tabla y verifica los datos
3. Puedes editar directamente desde aquí

### 9.2 Ver Logs de Queries
1. Ve a **Database > Query Performance**
2. Observa consultas lentas
3. Optimiza índices si es necesario

### 9.3 Ver Logs del Servidor
```bash
# En desarrollo
npm run dev

# Mira la consola para errors y warnings
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused"
**Solución:**
- Verifica que `SUPABASE_URL` es correcto
- Verifica que tienes internet
- Reinicia el servidor

### Problema: "Invalid API key"
**Solución:**
- Copia correctamente la clave desde Supabase
- Asegúrate de que no hay espacios extras
- Regenera la clave si es necesario

### Problema: "Row Level Security policy denied"
**Solución:**
- Verifica que el usuario está autenticado
- Comprueba que el `user_id` es correcto
- Revisa las políticas de RLS en la BD

### Problema: "Table doesn't exist"
**Solución:**
- Ejecuta nuevamente `schema.sql`
- Verifica que no hay errores en la ejecución
- Recarga el navegador

---

## 🎯 Próximos Pasos

1. ✅ Migrar todos los endpoints a Supabase
2. ✅ Probar funcionamiento completo
3. ✅ Implementar logs de auditoría
4. ✅ Configurar backups automáticos
5. ✅ Configurar alertas
6. ✅ Preparar para producción

---

## 📚 Recursos Útiles

- **Documentación Supabase**: https://supabase.com/docs
- **Documentación PostgreSQL**: https://www.postgresql.org/docs/
- **Supabase JavaScript SDK**: https://github.com/supabase/supabase-js
- **Ejemplos Supabase**: https://github.com/supabase/examples

---

## 💡 Tips y Mejores Prácticas

### 1. Usa Vistas para Queries Complejas
```javascript
// Mejor: usar vista en lugar de lógica en JS
const { data } = await supabase
  .from('v_dashboard_summary')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### 2. Cachea Datos que No Cambian Frecuentemente
```javascript
// Cachear categorías por 1 hora
const cacheKey = `categories_${userId}`;
cache.set(cacheKey, data, 3600);
```

### 3. Usa Paginación para Listas Grandes
```javascript
const limit = 20;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('transactions')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);
```

### 4. Valida Entrada del Usuario
```javascript
if (!description || description.trim().length === 0) {
  throw new Error('Descripción es requerida');
}
```

### 5. Manejo de Errores Robusto
```javascript
try {
  // operación
} catch (err) {
  console.error('Operation failed:', err.message);
  res.status(500).json({ error: 'Operación falló' });
}
```

---

## 🎉 ¡Felicidades!

Tu aplicación MisFinanzas está migrada a Supabase/PostgreSQL. Ahora tienes:

✅ Base de datos profesional y escalable
✅ Seguridad mejorada con RLS
✅ Mejor rendimiento
✅ Funciones PostgreSQL automáticas
✅ Auditoría y trazabilidad
✅ Preparado para producción

---

**Documentación creada el 27 de Abril de 2026**
**Para MisFinanzas - Sistema de Gestión de Finanzas Personales**
