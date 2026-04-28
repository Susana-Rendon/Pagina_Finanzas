-- =====================================================
-- MisFinanzas - Datos de Prueba para Supabase
-- Datos iniciales para demostración y testing
-- =====================================================

-- =====================================================
-- 1. INSERTAR USUARIOS DE PRUEBA
-- =====================================================

-- Usuario de prueba 1: Susana
INSERT INTO users (id, name, email, password_hash, avatar_color, language, currency, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Susana',
  'susana@misfinanzas.com',
  '$2b$10$HJiSVNj0jJFvpJhKa0j8.eM5R0n0QzDLf5J8Zq3L5M2N3O4P5Q6R',  -- Contraseña hasheada
  '6366f1',
  'es',
  'USD',
  NOW() - INTERVAL '6 months'
);

-- Usuario de prueba 2: Carlos
INSERT INTO users (id, name, email, password_hash, avatar_color, language, currency, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Carlos',
  'carlos@misfinanzas.com',
  '$2b$10$HJiSVNj0jJFvpJhKa0j8.eM5R0n0QzDLf5J8Zq3L5M2N3O4P5Q6S',
  '3b82f6',
  'es',
  'USD',
  NOW() - INTERVAL '3 months'
);

-- =====================================================
-- 2. INSERTAR CONFIGURACIÓN DE USUARIOS
-- =====================================================

INSERT INTO user_settings (id, user_id, monthly_income_target, monthly_expense_budget, savings_goal_monthly, notification_frequency, email_notifications)
VALUES (
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  3500.00,
  2000.00,
  700.00,
  'daily',
  TRUE
);

INSERT INTO user_settings (id, user_id, monthly_income_target, monthly_expense_budget, savings_goal_monthly, notification_frequency, email_notifications)
VALUES (
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  4000.00,
  2500.00,
  800.00,
  'weekly',
  TRUE
);

-- =====================================================
-- 3. INSERTAR CATEGORÍAS DE TRANSACCIONES
-- =====================================================

-- Categorías para Susana
INSERT INTO transaction_categories (id, user_id, name, type, icon, color, is_system)
VALUES 
  -- INGRESOS
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Salario', 'income', '💰', '22c55e', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Freelance', 'income', '💻', '84cc16', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Bonus', 'income', '🎁', 'fbbf24', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Inversiones', 'income', '📈', '10b981', TRUE),
  
  -- GASTOS
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Alimentación', 'expense', '🍔', 'f97316', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Transporte', 'expense', '🚗', '3b82f6', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Entretenimiento', 'expense', '🎬', '8b5cf6', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Servicios', 'expense', '💡', 'ec4899', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Salud', 'expense', '🏥', 'ef4444', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Educación', 'expense', '📚', '0ea5e9', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Ropa', 'expense', '👔', 'f472b6', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Vivienda', 'expense', '🏠', 'a16207', TRUE),
  
  -- AHORROS
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Ahorro General', 'saving', '🏦', '06b6d4', TRUE),
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Emergencia', 'saving', '⚠️', 'dc2626', TRUE);

-- =====================================================
-- 4. INSERTAR TRANSACCIONES DE EJEMPLO
-- =====================================================

-- Ingresos de Susana (mes actual)
INSERT INTO transactions (id, user_id, description, category_id, amount, type, transaction_date, note)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Salario mensual - Abril 2026',
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Salario' LIMIT 1),
  3200.00,
  'income',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  'Salario del mes'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND amount = 3200.00 
  AND type = 'income'
);

-- Gastos de Susana (mes actual)
INSERT INTO transactions (id, user_id, description, category_id, amount, type, transaction_date, note)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Supermercado Carrefour',
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Alimentación' LIMIT 1),
  125.50,
  'expense',
  CURRENT_DATE - INTERVAL '15 days',
  'Compras semanales'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND amount = 125.50
);

INSERT INTO transactions (id, user_id, description, category_id, amount, type, transaction_date, note)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Gasolina Shell',
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Transporte' LIMIT 1),
  75.00,
  'expense',
  CURRENT_DATE - INTERVAL '10 days',
  'Carga combustible'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND amount = 75.00
);

INSERT INTO transactions (id, user_id, description, category_id, amount, type, transaction_date, note)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Cine y película',
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Entretenimiento' LIMIT 1),
  35.00,
  'expense',
  CURRENT_DATE - INTERVAL '5 days',
  'Entrada de cine'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND amount = 35.00 
  AND description = 'Cine y película'
);

INSERT INTO transactions (id, user_id, description, category_id, amount, type, transaction_date, note)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Pago de servicios',
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Servicios' LIMIT 1),
  150.00,
  'expense',
  CURRENT_DATE - INTERVAL '3 days',
  'Electricidad y agua'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND amount = 150.00 
  AND description = 'Pago de servicios'
);

-- =====================================================
-- 5. INSERTAR TRANSACCIONES RECURRENTES (GASTOS FIJOS Y SUSCRIPCIONES)
-- =====================================================

-- Gastos fijos de Susana
INSERT INTO recurring_transactions (id, user_id, name, amount, type, frequency, due_day_of_month, start_date, is_active, notification_days_before, next_payment_date)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Alquiler apartamento',
  800.00,
  'fixed_expense',
  'monthly',
  1,
  CURRENT_DATE - INTERVAL '6 months',
  TRUE,
  7,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Alquiler apartamento'
);

INSERT INTO recurring_transactions (id, user_id, name, amount, type, frequency, due_day_of_month, start_date, is_active, notification_days_before, next_payment_date)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Seguro del auto',
  120.00,
  'fixed_expense',
  'monthly',
  15,
  CURRENT_DATE - INTERVAL '1 year',
  TRUE,
  5,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days'
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Seguro del auto'
);

-- Suscripciones de Susana
INSERT INTO recurring_transactions (id, user_id, name, amount, type, frequency, due_day_of_month, start_date, is_active, notification_days_before, next_payment_date)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Netflix',
  12.99,
  'subscription',
  'monthly',
  5,
  CURRENT_DATE - INTERVAL '1 year',
  TRUE,
  3,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days'
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Netflix'
);

INSERT INTO recurring_transactions (id, user_id, name, amount, type, frequency, due_day_of_month, start_date, is_active, notification_days_before, next_payment_date)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Spotify Premium',
  10.99,
  'subscription',
  'monthly',
  10,
  CURRENT_DATE - INTERVAL '2 years',
  TRUE,
  3,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 days'
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Spotify Premium'
);

INSERT INTO recurring_transactions (id, user_id, name, amount, type, frequency, due_day_of_month, start_date, is_active, notification_days_before, next_payment_date)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Gym - Fitness Center',
  45.00,
  'subscription',
  'monthly',
  20,
  CURRENT_DATE - INTERVAL '8 months',
  TRUE,
  5,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '20 days'
WHERE NOT EXISTS (
  SELECT 1 FROM recurring_transactions 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Gym - Fitness Center'
);

-- =====================================================
-- 6. INSERTAR METAS DE AHORRO
-- =====================================================

INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, priority, color, target_date, status, category)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Fondo de Emergencia',
  'Ahorrar 6 meses de gastos para emergencias',
  5000.00,
  1250.00,
  'high',
  'dc2626',
  CURRENT_DATE + INTERVAL '12 months',
  'active',
  'seguridad'
WHERE NOT EXISTS (
  SELECT 1 FROM savings_goals 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Fondo de Emergencia'
);

INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, priority, color, target_date, status, category)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Viaje a Europa',
  'Viaje de 3 semanas a Europa',
  3500.00,
  875.00,
  'medium',
  '3b82f6',
  CURRENT_DATE + INTERVAL '18 months',
  'active',
  'viaje'
WHERE NOT EXISTS (
  SELECT 1 FROM savings_goals 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Viaje a Europa'
);

INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, priority, color, target_date, status, category)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Auto nuevo',
  'Compra de auto último modelo',
  15000.00,
  3000.00,
  'high',
  'f97316',
  CURRENT_DATE + INTERVAL '30 months',
  'active',
  'compra'
WHERE NOT EXISTS (
  SELECT 1 FROM savings_goals 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Auto nuevo'
);

INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, priority, color, target_date, status, category)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Educación Continua',
  'Cursos online y certificaciones profesionales',
  2000.00,
  500.00,
  'medium',
  '0ea5e9',
  CURRENT_DATE + INTERVAL '12 months',
  'active',
  'educacion'
WHERE NOT EXISTS (
  SELECT 1 FROM savings_goals 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND name = 'Educación Continua'
);

-- =====================================================
-- 7. INSERTAR PRESUPUESTOS
-- =====================================================

-- Presupuesto de abril 2026 para Susana
INSERT INTO budgets (id, user_id, category_id, month_year, limit_amount, spent_amount, alert_threshold, is_active)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Alimentación' LIMIT 1),
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  400.00,
  250.50,
  80,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND month_year = DATE_TRUNC('month', CURRENT_DATE)::DATE
);

INSERT INTO budgets (id, user_id, category_id, month_year, limit_amount, spent_amount, alert_threshold, is_active)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Transporte' LIMIT 1),
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  250.00,
  75.00,
  75,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND month_year = DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND category_id = (SELECT id FROM transaction_categories WHERE name = 'Transporte' LIMIT 1)
);

INSERT INTO budgets (id, user_id, category_id, month_year, limit_amount, spent_amount, alert_threshold, is_active)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  (SELECT id FROM transaction_categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID AND name = 'Entretenimiento' LIMIT 1),
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  200.00,
  35.00,
  70,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM budgets 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND month_year = DATE_TRUNC('month', CURRENT_DATE)::DATE
  AND category_id = (SELECT id FROM transaction_categories WHERE name = 'Entretenimiento' LIMIT 1)
);

-- =====================================================
-- 8. INSERTAR RECOMENDACIONES FINANCIERAS
-- =====================================================

INSERT INTO financial_recommendations (id, user_id, title, description, type, impact_amount, priority)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Optimizar suscripciones de streaming',
  'Tienes 3 servicios de streaming (Netflix, Disney+, Amazon Prime). Considera mantener solo los más usados para ahorrar $15-20 mensuales.',
  'optimization',
  20.00,
  'high'
WHERE NOT EXISTS (
  SELECT 1 FROM financial_recommendations 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND title = 'Optimizar suscripciones de streaming'
);

INSERT INTO financial_recommendations (id, user_id, title, description, type, impact_amount, priority)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Meta de ahorro "Fondo de Emergencia" está 25% completada',
  'Excelente progreso. Si mantienes ahorros mensuales de $200, completarás tu fondo para diciembre.',
  'goal_milestone',
  NULL,
  'medium'
WHERE NOT EXISTS (
  SELECT 1 FROM financial_recommendations 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND type = 'goal_milestone'
  AND title LIKE '%Fondo de Emergencia%'
);

-- =====================================================
-- 9. INSERTAR NOTIFICACIONES
-- =====================================================

INSERT INTO notifications (id, user_id, title, message, type, priority)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Recordatorio: Alquiler vence en 1 día',
  'Tu pago de alquiler de $800 vence el 1 de mayo. Asegúrate de tener fondos disponibles.',
  'payment_reminder',
  'high'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND title LIKE '%Alquiler%'
);

INSERT INTO notifications (id, user_id, title, message, type, priority)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Presupuesto de Alimentación al 62%',
  'Has gastado $250 de tu presupuesto de $400 para alimentación en abril.',
  'budget_alert',
  'normal'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND title LIKE '%Presupuesto de Alimentación%'
);

-- =====================================================
-- 10. RESUMEN MENSUAL INICIAL
-- =====================================================

INSERT INTO monthly_summary (id, user_id, month_year, total_income, total_expenses, total_savings, fixed_expenses_amount, subscriptions_amount, net_flow, transaction_count)
SELECT 
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  3200.00,
  335.50,
  0,
  920.00,
  68.98,
  1876.52,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM monthly_summary 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
  AND month_year = DATE_TRUNC('month', CURRENT_DATE)::DATE
);

-- =====================================================
-- FIN DE DATOS DE PRUEBA
-- =====================================================

COMMIT;
