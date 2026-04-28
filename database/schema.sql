-- =====================================================
-- MisFinanzas - Schema PostgreSQL para Supabase
-- Diseño profesional, escalable y optimizado
-- =====================================================

-- =====================================================
-- 1. EXTENSION NECESARIAS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TABLAS PRINCIPALES - AUTENTICACIÓN Y USUARIOS
-- =====================================================

-- Tabla: users (Usuarios del sistema)
-- Almacena información de autenticación y perfil de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_color CHAR(6) DEFAULT '6366f1',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  language VARCHAR(5) DEFAULT 'es',
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- 3. TABLAS - CONFIGURACIÓN DE USUARIO
-- =====================================================

-- Tabla: user_settings (Configuración personalizada del usuario)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_income_target DECIMAL(12, 2) DEFAULT 0,
  monthly_expense_budget DECIMAL(12, 2) DEFAULT 0,
  savings_goal_monthly DECIMAL(12, 2) DEFAULT 0,
  notification_frequency VARCHAR(20) DEFAULT 'daily',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  export_frequency VARCHAR(20),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_settings_user UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- 4. TABLAS - CATEGORÍAS
-- =====================================================

-- Tabla: transaction_categories (Categorías de transacciones)
CREATE TABLE IF NOT EXISTS transaction_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'saving')),
  icon VARCHAR(50),
  color CHAR(6),
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_category UNIQUE(user_id, name, type)
);

CREATE INDEX idx_transaction_categories_user_id ON transaction_categories(user_id);
CREATE INDEX idx_transaction_categories_type ON transaction_categories(type);

-- =====================================================
-- 5. TABLAS - TRANSACCIONES
-- =====================================================

-- Tabla: transactions (Registro de transacciones)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'saving')),
  transaction_date DATE NOT NULL,
  note TEXT,
  tags TEXT[],
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);

-- =====================================================
-- 6. TABLAS - GASTOS RECURRENTES
-- =====================================================

-- Tabla: recurring_transactions (Transacciones recurrentes: gastos fijos y suscripciones)
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('fixed_expense', 'subscription')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  due_day_of_month INTEGER CHECK (due_day_of_month >= 1 AND due_day_of_month <= 31),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  notification_days_before INTEGER DEFAULT 2,
  last_payment_date DATE,
  next_payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_type ON recurring_transactions(type);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_transactions_next_payment ON recurring_transactions(next_payment_date);

-- =====================================================
-- 7. TABLAS - METAS DE AHORRO
-- =====================================================

-- Tabla: savings_goals (Metas de ahorro)
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color CHAR(6),
  target_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_status ON savings_goals(status);
CREATE INDEX idx_savings_goals_target_date ON savings_goals(target_date);

-- =====================================================
-- 8. TABLAS - PRESUPUESTOS
-- =====================================================

-- Tabla: budgets (Presupuestos por categoría)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  month_year DATE NOT NULL,
  limit_amount DECIMAL(12, 2) NOT NULL CHECK (limit_amount > 0),
  spent_amount DECIMAL(12, 2) DEFAULT 0 CHECK (spent_amount >= 0),
  alert_threshold PERCENTAGE DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_budget UNIQUE(user_id, category_id, month_year)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month_year ON budgets(month_year);

-- Crear tipo de dato personalizado para porcentaje
DO $$ BEGIN
  CREATE TYPE PERCENTAGE AS (value SMALLINT);
EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

ALTER TABLE budgets 
ALTER COLUMN alert_threshold TYPE SMALLINT USING alert_threshold;

-- =====================================================
-- 9. TABLAS - RESUMEN MENSUAL
-- =====================================================

-- Tabla: monthly_summary (Resumen financiero mensual)
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  total_income DECIMAL(12, 2) DEFAULT 0,
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_savings DECIMAL(12, 2) DEFAULT 0,
  fixed_expenses_amount DECIMAL(12, 2) DEFAULT 0,
  subscriptions_amount DECIMAL(12, 2) DEFAULT 0,
  net_flow DECIMAL(12, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_monthly_summary UNIQUE(user_id, month_year)
);

CREATE INDEX idx_monthly_summary_user_id ON monthly_summary(user_id);
CREATE INDEX idx_monthly_summary_month_year ON monthly_summary(month_year);

-- =====================================================
-- 10. TABLAS - NOTIFICACIONES
-- =====================================================

-- Tabla: notifications (Sistema de notificaciones)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment_reminder', 'budget_alert', 'goal_progress', 'recommendation', 'system', 'milestone')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  action_url TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- =====================================================
-- 11. TABLAS - RECORDATORIOS DE PAGO
-- =====================================================

-- Tabla: payment_reminders (Recordatorios de pago)
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_reminders_user_id ON payment_reminders(user_id);
CREATE INDEX idx_payment_reminders_reminder_date ON payment_reminders(reminder_date);
CREATE INDEX idx_payment_reminders_is_sent ON payment_reminders(is_sent);

-- =====================================================
-- 12. TABLAS - RECOMENDACIONES FINANCIERAS
-- =====================================================

-- Tabla: financial_recommendations (Recomendaciones automáticas)
CREATE TABLE IF NOT EXISTS financial_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('optimization', 'savings_opportunity', 'budget_adjustment', 'goal_milestone', 'subscription_review', 'general_advice')),
  impact_amount DECIMAL(12, 2),
  impact_percentage NUMERIC(5, 2),
  is_read BOOLEAN DEFAULT FALSE,
  is_acted_upon BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_financial_recommendations_user_id ON financial_recommendations(user_id);
CREATE INDEX idx_financial_recommendations_type ON financial_recommendations(type);
CREATE INDEX idx_financial_recommendations_is_read ON financial_recommendations(is_read);

-- =====================================================
-- 13. TABLAS - EVENTOS DE CALENDARIO
-- =====================================================

-- Tabla: calendar_events (Eventos del calendario financiero)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('income', 'expense', 'goal_milestone', 'reminder', 'custom')),
  amount DECIMAL(12, 2),
  color CHAR(6),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_event_date ON calendar_events(event_date);

-- =====================================================
-- 14. TABLAS - AUDITORÍA Y REGISTRO
-- =====================================================

-- Tabla: audit_logs (Registro de auditoría)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- 15. TABLAS - HISTORIAL DE CAMBIOS
-- =====================================================

-- Tabla: change_history (Historial de cambios)
CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_change_history_user_id ON change_history(user_id);
CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);

-- =====================================================
-- 16. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para transactions
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para recurring_transactions
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para savings_goals
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para budgets
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para monthly_summary
CREATE TRIGGER update_monthly_summary_updated_at BEFORE UPDATE ON monthly_summary
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para payment_reminders
CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 17. VISTAS ÚTILES
-- =====================================================

-- Vista: Dashboard Summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
  u.id as user_id,
  u.name,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN t.type = 'saving' THEN t.amount ELSE 0 END), 0) as total_savings,
  COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'fixed_expense'), 0) as fixed_expenses,
  COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'subscription'), 0) as subscriptions,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as net_flow
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.deleted_at IS NULL
LEFT JOIN recurring_transactions rt ON u.id = rt.user_id AND rt.is_active = TRUE
GROUP BY u.id, u.name;

-- Vista: Monthly Financial Overview
CREATE OR REPLACE VIEW v_monthly_overview AS
SELECT 
  DATE_TRUNC('month', t.transaction_date)::DATE as month,
  t.user_id,
  t.type,
  tc.name as category_name,
  COUNT(*) as transaction_count,
  SUM(t.amount) as total_amount,
  AVG(t.amount) as average_amount
FROM transactions t
LEFT JOIN transaction_categories tc ON t.category_id = tc.id
WHERE t.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', t.transaction_date), t.user_id, t.type, tc.name;

-- Vista: Goals Progress
CREATE OR REPLACE VIEW v_goals_progress AS
SELECT 
  sg.id,
  sg.user_id,
  sg.name,
  sg.target_amount,
  sg.current_amount,
  ROUND((sg.current_amount / NULLIF(sg.target_amount, 0)) * 100, 2) as progress_percentage,
  (sg.target_amount - sg.current_amount) as remaining_amount,
  CASE 
    WHEN sg.target_date IS NOT NULL THEN 
      EXTRACT(DAY FROM sg.target_date - CURRENT_DATE)::INTEGER
    ELSE NULL 
  END as days_remaining,
  sg.status
FROM savings_goals sg
WHERE sg.deleted_at IS NULL;

-- =====================================================
-- 18. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;

-- Políticas para transacciones (users solo ven sus propias transacciones)
CREATE POLICY users_see_own_transactions ON transactions
  USING (auth.uid() = user_id);

CREATE POLICY users_insert_own_transactions ON transactions
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_update_own_transactions ON transactions
  USING (auth.uid() = user_id);

-- Políticas similares para otras tablas multi-usuario
CREATE POLICY users_see_own_goals ON savings_goals
  USING (auth.uid() = user_id);

CREATE POLICY users_see_own_budgets ON budgets
  USING (auth.uid() = user_id);

CREATE POLICY users_see_own_notifications ON notifications
  USING (auth.uid() = user_id);

-- =====================================================
-- 19. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema. Almacena credenciales y datos de perfil.';
COMMENT ON TABLE transactions IS 'Registro de todas las transacciones (ingresos, gastos, ahorros) del usuario.';
COMMENT ON TABLE recurring_transactions IS 'Transacciones recurrentes: gastos fijos (alquileres, servicios) y suscripciones mensuales.';
COMMENT ON TABLE savings_goals IS 'Metas de ahorro que el usuario desea alcanzar con montos objetivos.';
COMMENT ON TABLE budgets IS 'Presupuestos mensuales por categoría de gasto.';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para recordatorios y alertas.';
COMMENT ON TABLE financial_recommendations IS 'Recomendaciones automáticas basadas en patrones de gastos.';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
