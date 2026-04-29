# 🎯 INICIO RÁPIDO - MisFinanzas + Supabase

## ⚡ En 5 Minutos

### 1. Crear Proyecto Supabase
```bash
# Ir a supabase.com → New Project
# Nombre: MisFinanzas
# Región: Miami (para América)
# Copiar URL y claves
```

### 2. Ejecutar Base de Datos
```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar en orden:
# 1. schema.sql (crear tablas)
# 2. seed_data.sql (datos de prueba)
# 3. functions.sql (funciones)
```

### 3. Configurar Node.js
```bash
cd MisFinanzas
npm install @supabase/supabase-js dotenv

# Crear .env con credenciales de Supabase
cp .env.example .env
# Editar .env con tus datos

npm start
```

### 4. ¡Listo!
```
http://localhost:3000
```

---

## 📁 Archivos Importantes

```
database/
├── schema.sql                   👈 Estructura BD (ejecutar primero)
├── seed_data.sql               👈 Datos de prueba
├── functions.sql               👈 Funciones PostgreSQL
├── supabase-client.js           👈 Cliente Node.js
├── DATABASE_DOCUMENTATION.md    👈 Documentación técnica
├── SETUP_GUIDE.md              👈 Guía paso a paso
├── MIGRATION_EXAMPLES.js        👈 Ejemplos de código
├── USEFUL_QUERIES.sql          👈 Queries útiles
├── EXECUTIVE_SUMMARY.md        👈 Resumen completo
└── README.md                    👈 Este archivo

.env.example                     👈 Copiar a .env y completar
```

---

## 🔑 Pasos Clave

### Paso 1: Supabase
- [ ] Registrarse en supabase.com
- [ ] Crear proyecto
- [ ] Copiar URL y claves API

### Paso 2: Base de Datos
- [ ] Copiar schema.sql a SQL Editor
- [ ] Ejecutar
- [ ] Copiar seed_data.sql
- [ ] Ejecutar
- [ ] Copiar functions.sql
- [ ] Ejecutar

### Paso 3: Código
- [ ] Crear .env con credenciales
- [ ] `npm install @supabase/supabase-js`
- [ ] Reemplazar import en server.js

### Paso 4: Prueba
- [ ] `npm start`
- [ ] http://localhost:3000
- [ ] Crear cuenta / Login
- [ ] Agregar transacción

---

## 💡 Tips Importantes

### ✅ DO's
- ✅ Guardá .env en lugar seguro
- ✅ Usá service_role_key en backend
- ✅ Usá anon_key en frontend
- ✅ Enableá RLS en Supabase
- ✅ Hacé backups regularmente

### ❌ DON'Ts
- ❌ No compartás .env
- ❌ No commitees .env a Git
- ❌ No pongas secrets en código
- ❌ No usés service_role_key en frontend
- ❌ No ignores los errores de validación

---

## 🐛 Si Algo Sale Mal

### Error: "Connection refused"
```bash
# Verificar que SUPABASE_URL es correcto
# Verificar internet
# Reiniciar servidor
```

### Error: "Invalid API key"
```bash
# Copiar nuevamente las claves
# Asegurar no hay espacios
# Regenerar claves en Supabase
```

### Error: "Table doesn't exist"
```bash
# Ejecutar schema.sql nuevamente
# Verificar sin errores
# Recargar navegador
```

---

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| EXECUTIVE_SUMMARY.md | 📊 Resumen completo del proyecto |
| DATABASE_DOCUMENTATION.md | 📖 Guía técnica de tablas y relaciones |
| SETUP_GUIDE.md | 🚀 Instalación paso a paso |
| MIGRATION_EXAMPLES.js | 🔄 Ejemplos de código antes/después |
| USEFUL_QUERIES.sql | 📋 Consultas útiles para debugging |

---

## 🎯 Próximos Pasos

1. ✅ Migración completada
2. → Actualizar todos los endpoints (ver MIGRATION_EXAMPLES.js)
3. → Testing completo
4. → Deploy a producción
5. → Monitoreo y mantenimiento

---

## 🚀 Ya Estás Listo

La estructura de BD está **100% lista**. 

Solo necesitás actualizar tu código Node.js para usar el nuevo cliente Supabase.

**Ver:** `database/MIGRATION_EXAMPLES.js` para ejemplos

---

**¿Preguntas?** Ver documentación en `database/` carpeta.

**¿Problemas?** Ver `SETUP_GUIDE.md` sección "Troubleshooting".

**¡Éxito!** 🎉
