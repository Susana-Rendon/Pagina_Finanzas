# MisFinanzas - Documentación de Base de Datos PostgreSQL/Supabase

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura de la Base de Datos](#arquitectura-de-la-base-de-datos)
3. [Tablas y Relaciones](#tablas-y-relaciones)
4. [Implementación en Supabase](#implementación-en-supabase)
5. [Integración con Node.js/Express](#integración-con-nodejs-express)
6. [Seguridad y Autenticación](#seguridad-y-autenticación)
7. [Mejores Prácticas](#mejores-prácticas)

---

## Descripción General

**MisFinanzas** es una aplicación de gestión de finanzas personales que ha sido migrada de **SQLite a PostgreSQL (Supabase)** para mayor escalabilidad, seguridad y rendimiento.

### Objetivos de la Migración:
- ✅ Escalabilidad empresarial
- ✅ Seguridad mejorada con Row Level Security (RLS)
- ✅ Mejor rendimiento con índices optimizados
- ✅ Relaciones y constraints robustos
- ✅ Auditoría y trazabilidad de cambios
- ✅ Preparación para futuras integraciones

---

## Arquitectura de la Base de Datos

### Diagrama de Tablas Principales

```
┌─────────────────────────────────────────────────────┐
│                     USERS                            │
│  (Autenticación y Perfil de Usuario)                │
│  PK: id (UUID)                                      │
│  FK: Relaciones con casi todas las tablas           │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────────┐  ┌──────────────┐  ┌─────────────────┐
    │TRANSACTIONS│  │CATEGORIES    │  │USER_SETTINGS    │
    │PK: id (UUID)  │PK: id (UUID) │  │PK: id (UUID)    │
    │FK: user_id    │FK: user_id   │  │FK: user_id (1:1)│
    │FK: category_id│             │  │                 │
    └────────────┘  └──────────────┘  └─────────────────┘
        │
        └─────────────────────────┬──────────────────────┐
                                  │                      │
                    ┌─────────────▼──────────┐    ┌──────▼──────────┐
                    │RECURRING_TRANSACTIONS  │    │BUDGETS          │
                    │(Gastos Fijos/Suscr.)   │    │PK: id (UUID)    │
                    │PK: id (UUID)           │    │FK: user_id      │
                    │FK: user_id             │    │FK: category_id  │
                    │FK: category_id         │    └─────────────────┘
                    └───────────┬────────────┘
                                │
                    ┌───────────▼──────────┐
                    │PAYMENT_REMINDERS     │
                    │PK: id (UUID)         │
                    │FK: user_id           │
                    │FK: recurring_trans_id│
                    └──────────────────────┘

┌─────────────────────────────────────────────────┐
│           ANÁLISIS Y REPORTES                    │
├─────────────────────────────────────────────────┤
│ • MONTHLY_SUMMARY (Resúmenes mensuales)        │
│ • NOTIFICATIONS (Sistema de notificaciones)     │
│ • FINANCIAL_RECOMMENDATIONS (Recomendaciones)  │
│ • CALENDAR_EVENTS (Eventos del calendario)      │
│ • SAVINGS_GOALS (Metas de ahorro)              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           AUDITORÍA Y SEGURIDAD                 │
├─────────────────────────────────────────────────┤
│ • AUDIT_LOGS (Registro de acciones)             │
│ • CHANGE_HISTORY (Historial de cambios)         │
└─────────────────────────────────────────────────┘
```

---

## Tablas y Relaciones

### 1. **USERS** - Tabla Principal de Usuarios
```sql
-- Almacena información de autenticación y perfil
CREATE TABLE users (
  id UUID PRIMARY KEY,                    -- ID único
  name TEXT NOT NULL,                     -- Nombre completo
  email TEXT NOT NULL UNIQUE,             -- Email único
  password_hash TEXT NOT NULL,            -- Contraseña hasheada
  avatar_color CHAR(6),                   -- Color del avatar
  notifications_enabled BOOLEAN,          -- Notificaciones activas
  dark_mode BOOLEAN,                      -- Preferencia de modo oscuro
  language VARCHAR(5),                    -- Idioma (es, en)
  currency VARCHAR(3),                    -- Moneda (USD, EUR)
  created_at TIMESTAMP,                   -- Fecha de creación
  updated_at TIMESTAMP,                   -- Última actualización
  last_login TIMESTAMP,                   -- Último login
  is_active BOOLEAN,                      -- Usuario activo
  deleted_at TIMESTAMP                    -- Fecha de eliminación lógica
)
```

### 2. **TRANSACTION_CATEGORIES** - Categorías de Transacciones
```sql
-- Define las categorías que puede usar cada usuario
CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,          -- Categorías por usuario
  name VARCHAR(50) NOT NULL,              -- Nombre (Comida, Transporte, etc)
  type VARCHAR(20) CHECK (type IN ('income', 'expense', 'saving')),
  icon VARCHAR(50),                       -- Emoji o ícono
  color CHAR(6),                          -- Color hexadecimal
  is_system BOOLEAN,                      -- ¿Es categoría del sistema?
  UNIQUE(user_id, name, type)
)
```

### 3. **TRANSACTIONS** - Registro de Transacciones
```sql
-- Todas las transacciones (ingresos, gastos, ahorros)
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  category_id UUID REFERENCES transaction_categories,
  description TEXT NOT NULL,              -- Descripción (ej: "Gasolina Shell")
  amount DECIMAL(12, 2) NOT NULL,         -- Monto (siempre positivo)
  type VARCHAR(20),                       -- 'income', 'expense', 'saving'
  transaction_date DATE NOT NULL,         -- Fecha de la transacción
  note TEXT,                              -- Notas adicionales
  tags TEXT[],                            -- Etiquetas para filtrado
  receipt_url TEXT,                       -- URL del comprobante
  is_recurring BOOLEAN,                   -- ¿Es recurrente?
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP                    -- Eliminación lógica
)
-- Índices: user_id, transaction_date, type, user_date
```

### 4. **RECURRING_TRANSACTIONS** - Gastos Fijos y Suscripciones
```sql
-- Transacciones recurrentes automáticas
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  name VARCHAR(100) NOT NULL,             -- "Netflix", "Alquiler", etc
  amount DECIMAL(12, 2) NOT NULL,         -- Monto mensual
  type VARCHAR(50),                       -- 'fixed_expense' o 'subscription'
  frequency VARCHAR(20),                  -- 'weekly', 'monthly', 'quarterly'
  due_day_of_month INTEGER,               -- Día del mes (1-31)
  start_date DATE NOT NULL,               -- Fecha de inicio
  end_date DATE,                          -- Fecha de fin (opcional)
  is_active BOOLEAN,                      -- ¿Está activa?
  payment_method VARCHAR(50),             -- "tarjeta", "transferencia"
  notification_days_before INTEGER,       -- Días antes para recordatorio
  last_payment_date DATE,                 -- Último pago
  next_payment_date DATE NOT NULL,        -- Próximo pago (calculado)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 5. **SAVINGS_GOALS** - Metas de Ahorro
```sql
-- Objetivos de ahorro del usuario
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  name VARCHAR(100) NOT NULL,             -- "Auto nuevo", "Vacaciones"
  description TEXT,                       -- Descripción detallada
  target_amount DECIMAL(12, 2) NOT NULL,  -- Meta en dinero
  current_amount DECIMAL(12, 2),          -- Dinero ahorrado
  priority VARCHAR(20),                   -- 'low', 'medium', 'high'
  color CHAR(6),                          -- Color visual
  target_date DATE,                       -- Fecha objetivo
  status VARCHAR(20),                     -- 'active', 'completed', 'paused'
  category VARCHAR(50),                   -- 'viaje', 'compra', etc
  created_at TIMESTAMP,
  completed_at TIMESTAMP
)
```

### 6. **BUDGETS** - Presupuestos Mensuales
```sql
-- Presupuestos por categoría y mes
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  category_id UUID REFERENCES transaction_categories,
  month_year DATE NOT NULL,               -- Mes (ej: 2026-04-01)
  limit_amount DECIMAL(12, 2) NOT NULL,   -- Límite presupuestado
  spent_amount DECIMAL(12, 2),            -- Gastado hasta ahora
  alert_threshold SMALLINT,               -- % para alerta (80)
  is_active BOOLEAN,
  UNIQUE(user_id, category_id, month_year)
)
```

### 7. **MONTHLY_SUMMARY** - Resumen Mensual
```sql
-- Resumen calculado de cada mes
CREATE TABLE monthly_summary (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  month_year DATE NOT NULL,               -- Mes
  total_income DECIMAL(12, 2),            -- Ingresos totales
  total_expenses DECIMAL(12, 2),          -- Gastos totales
  total_savings DECIMAL(12, 2),           -- Ahorros totales
  fixed_expenses_amount DECIMAL(12, 2),   -- Gastos fijos
  subscriptions_amount DECIMAL(12, 2),    -- Suscripciones
  net_flow DECIMAL(12, 2),                -- Flujo neto
  transaction_count INTEGER,              -- Número de transacciones
  UNIQUE(user_id, month_year)
)
```

### 8. **NOTIFICATIONS** - Sistema de Notificaciones
```sql
-- Notificaciones para el usuario
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),                       -- 'payment_reminder', 'budget_alert'
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20),                   -- 'low', 'normal', 'high', 'urgent'
  action_url TEXT,                        -- Link para acción
  created_at TIMESTAMP
)
```

### 9. **FINANCIAL_RECOMMENDATIONS** - Recomendaciones Automáticas
```sql
-- Recomendaciones basadas en análisis
CREATE TABLE financial_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50),                       -- 'optimization', 'savings_opportunity'
  impact_amount DECIMAL(12, 2),           -- Dinero que podría ahorrar
  priority VARCHAR(20),
  is_read BOOLEAN,
  created_at TIMESTAMP
)
```

### 10. **PAYMENT_REMINDERS** - Recordatorios de Pago
```sql
-- Recordatorios de transacciones recurrentes próximas
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users,
  recurring_transaction_id UUID REFERENCES recurring_transactions,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN,
  is_dismissed BOOLEAN,
  created_at TIMESTAMP
)
```

### Tablas Adicionales de Auditoría
- **AUDIT_LOGS**: Registro de todas las acciones del sistema
- **CHANGE_HISTORY**: Historial de cambios en datos
- **USER_SETTINGS**: Configuración personalizada del usuario
- **CALENDAR_EVENTS**: Eventos del calendario financiero

---

## Implementación en Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nueva organización y proyecto
3. Copiar la URL y API Keys:
   - `SUPABASE_URL`: URL del proyecto
   - `SUPABASE_ANON_KEY`: Clave anónima
   - `SUPABASE_SERVICE_ROLE_KEY`: Clave de administrador

### Paso 2: Ejecutar Scripts SQL

1. Ir a **SQL Editor** en Supabase
2. Ejecutar en orden:
   - `schema.sql` - Crear estructura
   - `seed_data.sql` - Datos de prueba
   - `functions.sql` - Funciones útiles

### Paso 3: Configurar Autenticación

```sql
-- Habilitar autenticación básica en Supabase Auth
-- El sistema usará Supabase Auth o tu propio sistema de usuarios
```

### Paso 4: Configurar Row Level Security (RLS)

```sql
-- Las políticas RLS ya están incluidas en schema.sql
-- Verificar que estén habilitadas:

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
-- ... (todas las tablas)

-- Las políticas garantizan que usuarios solo vean sus datos
```

---

## Integración con Node.js/Express

### 1. Instalar Dependencias

```bash
npm install @supabase/supabase-js
npm install dotenv
```

### 2. Configuración (`.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@your-project.supabase.co:5432/postgres

# Node Configuration
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key
```

### 3. Cliente Supabase en Node.js

```javascript
// database.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
```

### 4. Ejemplo: Obtener Dashboard Summary

**Antes (SQLite):**
```javascript
const transactions = await runQuery('SELECT * FROM transactions WHERE user_id = ?', [userId]);
// ... lógica manual de cálculo
```

**Después (Supabase/PostgreSQL):**
```javascript
const { data, error } = await supabase
  .from('v_dashboard_summary')
  .select('*')
  .eq('user_id', userId)
  .single();

// El resultado viene pre-calculado con VISTAS
console.log(data.total_income, data.net_flow);
```

### 5. Operaciones CRUD Comunes

#### Crear Transacción
```javascript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    user_id: userId,
    category_id: categoryId,
    description: 'Compra en mercado',
    amount: 125.50,
    type: 'expense',
    transaction_date: '2026-04-27',
    note: 'Compras semanales'
  })
  .select();
```

#### Leer Transacciones
```javascript
const { data, error } = await supabase
  .from('transactions')
  .select('*, transaction_categories(name, icon, color)')
  .eq('user_id', userId)
  .eq('type', 'expense')
  .order('transaction_date', { ascending: false })
  .limit(20);
```

#### Actualizar Transacción
```javascript
const { data, error } = await supabase
  .from('transactions')
  .update({
    description: 'Nueva descripción',
    amount: 150.00
  })
  .eq('id', transactionId)
  .eq('user_id', userId)
  .select();
```

#### Eliminar (Lógica)
```javascript
const { data, error } = await supabase
  .from('transactions')
  .update({ deleted_at: new Date() })
  .eq('id', transactionId)
  .eq('user_id', userId);
```

### 6. Llamar Funciones PostgreSQL

```javascript
// Obtener resumen del dashboard
const { data, error } = await supabase
  .rpc('get_dashboard_summary', {
    p_user_id: userId
  });

// Obtener próximas transacciones recurrentes
const { data: upcoming } = await supabase
  .rpc('get_upcoming_recurring_transactions', {
    p_user_id: userId,
    p_days_ahead: 30
  });

// Obtener gastos por categoría
const { data: categories } = await supabase
  .rpc('get_expenses_by_category', {
    p_user_id: userId,
    p_month: '2026-04-01'
  });
```

### 7. Ejemplos de Endpoints Actualizados

#### Obtener Resumen Mensual
```javascript
app.get('/api/summary', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const { data: dashboard, error: dashError } = await supabase
      .rpc('get_dashboard_summary', { p_user_id: userId });
    
    const { data: recurring, error: recError } = await supabase
      .rpc('get_upcoming_recurring_transactions', { 
        p_user_id: userId, 
        p_days_ahead: 7 
      });
    
    const { data: goals, error: goalError } = await supabase
      .rpc('calculate_goals_progress', { p_user_id: userId });
    
    if (dashError || recError || goalError) throw Error('DB Error');
    
    res.json({
      totals: dashboard[0],
      reminders: recurring,
      goals: goals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### Crear Transacción
```javascript
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { description, category, amount, type, date, note } = req.body;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: category,
        description,
        amount,
        type,
        transaction_date: date,
        note
      })
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## Seguridad y Autenticación

### 1. Row Level Security (RLS)

Todas las tablas tienen políticas RLS habilitadas:

```sql
-- Usuarios solo ven sus propias transacciones
CREATE POLICY users_see_own_transactions ON transactions
  USING (auth.uid() = user_id);

-- Similar para otras tablas
```

### 2. Hashing de Contraseñas

Usar **bcrypt** para almacenar contraseñas:

```javascript
const bcrypt = require('bcrypt');

// Registrar
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 3. Variables de Entorno

```env
# NUNCA exponer claves públicamente
SUPABASE_SERVICE_ROLE_KEY=secret-key-do-not-share

# En producción usar SUPABASE_ANON_KEY en el frontend
SUPABASE_ANON_KEY=public-key-ok-to-share
```

### 4. Validación de Datos

```javascript
// Validar entrada del usuario
const validateTransaction = (data) => {
  if (!data.description || !data.amount || !data.type) {
    throw new Error('Campos requeridos faltantes');
  }
  if (data.amount <= 0) {
    throw new Error('Monto debe ser mayor a 0');
  }
  if (!['income', 'expense', 'saving'].includes(data.type)) {
    throw new Error('Tipo inválido');
  }
  return true;
};
```

---

## Mejores Prácticas

### 1. Índices Optimizados
✅ Ya creados en `schema.sql`:
- `idx_transactions_user_id` - Búsquedas por usuario
- `idx_transactions_transaction_date` - Filtrado por fecha
- `idx_recurring_transactions_next_payment` - Próximos pagos

### 2. Triggers Automáticos
✅ Campos `updated_at` se actualizan automáticamente

### 3. Vistas de Base de Datos
Uso recomendado de vistas:
- `v_dashboard_summary` - Resumen rápido
- `v_monthly_overview` - Análisis mensual
- `v_goals_progress` - Progreso de metas

### 4. Paginación

```javascript
// Evitar traer todos los datos
const limit = 20;
const offset = (page - 1) * limit;

const { data } = await supabase
  .from('transactions')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .range(offset, offset + limit - 1)
  .order('transaction_date', { ascending: false });
```

### 5. Búsquedas Eficientes

```javascript
// Usar filtros de Supabase en lugar de traer todo
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'expense')
  .gte('transaction_date', '2026-04-01')
  .lte('transaction_date', '2026-04-30');
```

### 6. Transacciones

```javascript
// En PostgreSQL usar transacciones explícitas
const { data, error } = await supabase
  .rpc('create_transaction_with_budget_check', {
    p_user_id: userId,
    p_amount: amount,
    p_category_id: categoryId
  });
```

### 7. Caché Inteligente

```javascript
// Cachear datos que cambian poco
const getCategoriesCache = async (userId) => {
  const cacheKey = `categories_${userId}`;
  let cached = cache.get(cacheKey);
  
  if (!cached) {
    const { data } = await supabase
      .from('transaction_categories')
      .select('*')
      .eq('user_id', userId);
    
    cache.set(cacheKey, data, 3600); // 1 hora
    cached = data;
  }
  
  return cached;
};
```

---

## Checklist de Migración

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar `schema.sql`
- [ ] Ejecutar `seed_data.sql`
- [ ] Ejecutar `functions.sql`
- [ ] Configurar variables `.env`
- [ ] Instalar `@supabase/supabase-js`
- [ ] Actualizar `db.js` a cliente Supabase
- [ ] Actualizar todos los endpoints en `server.js`
- [ ] Probar autenticación
- [ ] Probar CRUD de transacciones
- [ ] Pruebas de rendimiento
- [ ] Implementar logs de auditoría
- [ ] Configurar backups automáticos
- [ ] Documentar cambios

---

## Contacto y Soporte

Para problemas con:
- **Supabase**: https://supabase.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Node.js**: https://nodejs.org/docs/

---

**Documentación generada para MisFinanzas**
**Versión: 1.0 - 27 de Abril de 2026**
