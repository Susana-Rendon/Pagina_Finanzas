-- =====================================================
-- MisFinanzas - Consultas SQL Útiles
-- Colección de queries frecuentes para análisis y debugging
-- =====================================================

-- =====================================================
-- ANÁLISIS RÁPIDO
-- =====================================================

-- Ver usuarios registrados y sus totales
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(t.id) as total_transactions,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
  u.created_at
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, u.created_at
ORDER BY u.created_at DESC;

-- Ver estado de gastos fijos de un usuario
SELECT 
  rt.id,
  rt.name,
  rt.amount,
  rt.frequency,
  rt.due_day_of_month,
  rt.next_payment_date,
  rt.is_active,
  CASE 
    WHEN rt.next_payment_date <= CURRENT_DATE + INTERVAL '7 days' THEN '⚠️ Próximo'
    WHEN rt.next_payment_date <= CURRENT_DATE THEN '🔴 VENCIDO'
    ELSE '✅ Dentro de plazo'
  END as status
FROM recurring_transactions rt
WHERE rt.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND rt.is_active = TRUE
ORDER BY rt.next_payment_date;

-- Ver progreso de metas de ahorro
SELECT 
  sg.name,
  sg.target_amount,
  sg.current_amount,
  ROUND((sg.current_amount / NULLIF(sg.target_amount, 0)) * 100, 2) as progress_percentage,
  (sg.target_amount - sg.current_amount) as remaining,
  sg.target_date,
  CASE 
    WHEN sg.target_date IS NOT NULL THEN EXTRACT(DAY FROM sg.target_date - CURRENT_DATE)::INT
    ELSE NULL
  END as days_remaining,
  sg.status
FROM savings_goals sg
WHERE sg.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND sg.deleted_at IS NULL
ORDER BY sg.priority DESC;

-- =====================================================
-- REPORTES MENSUALES
-- =====================================================

-- Resumen financiero mes actual
SELECT 
  DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
  COUNT(*) FILTER (WHERE t.type = 'income') as income_transactions,
  COUNT(*) FILTER (WHERE t.type = 'expense') as expense_transactions,
  SUM(t.amount) FILTER (WHERE t.type = 'income') as total_income,
  SUM(t.amount) FILTER (WHERE t.type = 'expense') as total_expenses,
  (
    SUM(t.amount) FILTER (WHERE t.type = 'income') - 
    SUM(t.amount) FILTER (WHERE t.type = 'expense')
  ) as net_flow
FROM transactions t
WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
  AND t.deleted_at IS NULL;

-- Comparativa: mes actual vs mes anterior
SELECT 
  COALESCE(curr.month, prev.month) as month,
  COALESCE(curr.month_income, 0) as current_income,
  COALESCE(prev.month_income, 0) as previous_income,
  COALESCE(curr.month_expenses, 0) as current_expenses,
  COALESCE(prev.month_expenses, 0) as previous_expenses,
  ROUND((
    (COALESCE(curr.month_income, 0) - COALESCE(prev.month_income, 0)) / 
    NULLIF(COALESCE(prev.month_income, 1), 0) * 100
  ), 2) as income_change_percentage
FROM (
  SELECT 
    DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
    SUM(t.amount) FILTER (WHERE t.type = 'income') as month_income,
    SUM(t.amount) FILTER (WHERE t.type = 'expense') as month_expenses
  FROM transactions t
  WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
    AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    AND t.deleted_at IS NULL
) curr
FULL OUTER JOIN (
  SELECT 
    (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE as month,
    SUM(t.amount) FILTER (WHERE t.type = 'income') as month_income,
    SUM(t.amount) FILTER (WHERE t.type = 'expense') as month_expenses
  FROM transactions t
  WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
    AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND t.deleted_at IS NULL
) prev ON 1=1;

-- Últimas transacciones con categorías
SELECT 
  t.id,
  t.description,
  tc.name as category,
  tc.color,
  t.amount,
  t.type,
  t.transaction_date,
  t.note,
  t.created_at
FROM transactions t
LEFT JOIN transaction_categories tc ON t.category_id = tc.id
WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND t.deleted_at IS NULL
ORDER BY t.transaction_date DESC
LIMIT 20;

-- =====================================================
-- ANÁLISIS POR CATEGORÍA
-- =====================================================

-- Gastos por categoría (mes actual)
SELECT 
  tc.name,
  tc.color,
  tc.icon,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_spent,
  ROUND(SUM(t.amount) / (
    SELECT SUM(amount) FROM transactions 
    WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
      AND type = 'expense'
      AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
      AND deleted_at IS NULL
  ) * 100, 2) as percentage_of_expenses
FROM transaction_categories tc
LEFT JOIN transactions t ON tc.id = t.category_id
  AND t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND t.type = 'expense'
  AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
  AND t.deleted_at IS NULL
WHERE tc.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND tc.type = 'expense'
GROUP BY tc.id, tc.name, tc.color, tc.icon
ORDER BY total_spent DESC NULLS LAST;

-- Categorías con presupuesto vs gasto real
SELECT 
  b.month_year,
  tc.name as category,
  b.limit_amount as budget,
  b.spent_amount as actual_spent,
  (b.limit_amount - b.spent_amount) as remaining,
  ROUND((b.spent_amount / NULLIF(b.limit_amount, 0)) * 100, 2) as percentage_used,
  CASE 
    WHEN b.spent_amount / NULLIF(b.limit_amount, 0) >= 0.9 THEN '🔴 Crítico (>90%)'
    WHEN b.spent_amount / NULLIF(b.limit_amount, 0) >= b.alert_threshold / 100.0 THEN '🟠 Alerta'
    ELSE '✅ OK'
  END as budget_status
FROM budgets b
LEFT JOIN transaction_categories tc ON b.category_id = tc.id
WHERE b.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND b.is_active = TRUE
ORDER BY b.month_year DESC, percentage_used DESC;

-- =====================================================
-- AUDITORÍA Y DEBUGGING
-- =====================================================

-- Ver cambios recientes en transacciones
SELECT 
  ch.entity_id as transaction_id,
  ch.field_name,
  ch.old_value,
  ch.new_value,
  ch.changed_at
FROM change_history ch
WHERE ch.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND ch.entity_type = 'transactions'
ORDER BY ch.changed_at DESC
LIMIT 20;

-- Historial de auditoría de un usuario
SELECT 
  a.action,
  a.entity_type,
  a.entity_id,
  a.new_values,
  a.created_at
FROM audit_logs a
WHERE a.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
ORDER BY a.created_at DESC
LIMIT 50;

-- Verificar integridad de datos
SELECT 
  'transactions' as entity,
  COUNT(*) as total_records,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_records,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_records,
  SUM(CASE WHEN amount <= 0 THEN 1 ELSE 0 END) as invalid_amounts
FROM transactions
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID

UNION ALL

SELECT 
  'recurring_transactions',
  COUNT(*),
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END),
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN amount <= 0 THEN 1 ELSE 0 END)
FROM recurring_transactions
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID

UNION ALL

SELECT 
  'savings_goals',
  COUNT(*),
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END),
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN target_amount <= 0 THEN 1 ELSE 0 END)
FROM savings_goals
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- =====================================================
-- RENDIMIENTO Y OPTIMIZACIÓN
-- =====================================================

-- Consultas lentas (si PostgreSQL está registrando)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 20;

-- Índices por usar
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Uso de espacio en disco
SELECT 
  table_name,
  ROUND(pg_total_relation_size(table_name) / 1024.0 / 1024.0, 2) as size_mb
FROM (
  SELECT table_schema || '.' || table_name as table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t
ORDER BY pg_total_relation_size(t.table_name) DESC;

-- =====================================================
-- MANTENIMIENTO
-- =====================================================

-- Limpiar registros borrados antiguos (mayor a 1 año)
-- ⚠️ CUIDADO: Esta consulta elimina datos permanentemente
/*
DELETE FROM transactions
WHERE deleted_at IS NOT NULL
  AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

DELETE FROM savings_goals
WHERE deleted_at IS NOT NULL
  AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

DELETE FROM recurring_transactions
WHERE deleted_at IS NOT NULL
  AND deleted_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
*/

-- Recalcular monthly_summary
REFRESH MATERIALIZED VIEW monthly_summary;

-- =====================================================
-- EXPORTAR DATOS (Para Excel/CSV)
-- =====================================================

-- Exportar transacciones con toda la información
SELECT 
  t.transaction_date as Fecha,
  tc.name as Categoría,
  t.description as Descripción,
  CASE 
    WHEN t.type = 'income' THEN t.amount
    ELSE 0
  END as Ingresos,
  CASE 
    WHEN t.type = 'expense' THEN t.amount
    ELSE 0
  END as Gastos,
  CASE 
    WHEN t.type = 'saving' THEN t.amount
    ELSE 0
  END as Ahorros,
  t.note as Notas
FROM transactions t
LEFT JOIN transaction_categories tc ON t.category_id = tc.id
WHERE t.user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
  AND t.deleted_at IS NULL
ORDER BY t.transaction_date DESC;

-- =====================================================
-- TIPS DE RENDIMIENTO
-- =====================================================

-- Ejecutar ANALYZE para actualizar estadísticas
-- ANALYZE transactions;

-- Ver planes de ejecución
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM transactions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID LIMIT 100;

-- Vacío (liberar espacio)
-- VACUUM ANALYZE transactions;

-- =====================================================
-- FIN DE CONSULTAS ÚTILES
-- =====================================================
