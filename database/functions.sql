-- =====================================================
-- MisFinanzas - Funciones SQL Útiles
-- Funciones para operaciones comunes y análisis
-- =====================================================

-- =====================================================
-- 1. FUNCIÓN: Obtener resumen de dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID)
RETURNS TABLE (
  total_balance DECIMAL,
  monthly_income DECIMAL,
  monthly_expenses DECIMAL,
  monthly_savings DECIMAL,
  fixed_expenses_monthly DECIMAL,
  subscriptions_monthly DECIMAL,
  net_flow DECIMAL,
  available_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0)::DECIMAL,
    COALESCE(SUM(CASE WHEN t.type = 'income' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0)::DECIMAL,
    COALESCE(SUM(CASE WHEN t.type = 'expense' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0)::DECIMAL,
    COALESCE(SUM(CASE WHEN t.type = 'saving' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0)::DECIMAL,
    COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'fixed_expense' AND rt.is_active), 0)::DECIMAL,
    COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'subscription' AND rt.is_active), 0)::DECIMAL,
    (
      COALESCE(SUM(CASE WHEN t.type = 'income' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN t.type = 'expense' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'fixed_expense' AND rt.is_active), 0) -
      COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'subscription' AND rt.is_active), 0)
    )::DECIMAL,
    (
      COALESCE(SUM(CASE WHEN t.type = 'income' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN t.type = 'expense' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN t.type = 'saving' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'fixed_expense' AND rt.is_active), 0) -
      COALESCE(SUM(rt.amount) FILTER (WHERE rt.type = 'subscription' AND rt.is_active), 0)
    )::DECIMAL
  FROM transactions t
  FULL OUTER JOIN recurring_transactions rt ON rt.user_id = p_user_id
  WHERE t.user_id = p_user_id AND t.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNCIÓN: Obtener próximas transacciones recurrentes
-- =====================================================
CREATE OR REPLACE FUNCTION get_upcoming_recurring_transactions(p_user_id UUID, p_days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  amount DECIMAL,
  type VARCHAR,
  next_payment_date DATE,
  days_until_due INTEGER,
  frequency VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.name,
    rt.amount,
    rt.type,
    rt.next_payment_date,
    (rt.next_payment_date - CURRENT_DATE)::INTEGER,
    rt.frequency
  FROM recurring_transactions rt
  WHERE rt.user_id = p_user_id 
    AND rt.is_active = TRUE
    AND rt.next_payment_date <= (CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL)
    AND rt.deleted_at IS NULL
  ORDER BY rt.next_payment_date ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNCIÓN: Obtener gasto por categoría (mes actual)
-- =====================================================
CREATE OR REPLACE FUNCTION get_expenses_by_category(p_user_id UUID, p_month DATE DEFAULT NULL)
RETURNS TABLE (
  category_name VARCHAR,
  category_color CHAR(6),
  total_amount DECIMAL,
  transaction_count INTEGER,
  percentage_of_total DECIMAL
) AS $$
DECLARE
  v_month DATE;
  v_total_expenses DECIMAL;
BEGIN
  v_month := COALESCE(p_month, DATE_TRUNC('month', CURRENT_DATE)::DATE);
  
  SELECT SUM(t.amount) INTO v_total_expenses
  FROM transactions t
  WHERE t.user_id = p_user_id 
    AND t.type = 'expense'
    AND DATE_TRUNC('month', t.transaction_date) = v_month
    AND t.deleted_at IS NULL;
  
  v_total_expenses := COALESCE(v_total_expenses, 0);
  
  RETURN QUERY
  SELECT 
    tc.name,
    tc.color,
    COALESCE(SUM(t.amount), 0)::DECIMAL,
    COUNT(t.id)::INTEGER,
    CASE 
      WHEN v_total_expenses > 0 THEN (COALESCE(SUM(t.amount), 0) / v_total_expenses * 100)::DECIMAL
      ELSE 0
    END
  FROM transaction_categories tc
  LEFT JOIN transactions t ON tc.id = t.category_id 
    AND t.user_id = p_user_id 
    AND t.type = 'expense'
    AND DATE_TRUNC('month', t.transaction_date) = v_month
    AND t.deleted_at IS NULL
  WHERE tc.user_id = p_user_id AND tc.type = 'expense'
  GROUP BY tc.id, tc.name, tc.color
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN: Calcular progreso de metas de ahorro
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_goals_progress(p_user_id UUID)
RETURNS TABLE (
  goal_id UUID,
  goal_name VARCHAR,
  target_amount DECIMAL,
  current_amount DECIMAL,
  progress_percentage DECIMAL,
  remaining_amount DECIMAL,
  days_remaining INTEGER,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sg.id,
    sg.name,
    sg.target_amount,
    sg.current_amount,
    ROUND((sg.current_amount / NULLIF(sg.target_amount, 0)) * 100, 2)::DECIMAL,
    (sg.target_amount - sg.current_amount)::DECIMAL,
    CASE 
      WHEN sg.target_date IS NOT NULL THEN 
        (sg.target_date - CURRENT_DATE)::INTEGER
      ELSE NULL::INTEGER
    END,
    sg.status
  FROM savings_goals sg
  WHERE sg.user_id = p_user_id AND sg.deleted_at IS NULL
  ORDER BY sg.priority DESC, sg.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCIÓN: Generar recomendaciones automáticas
-- =====================================================
CREATE OR REPLACE FUNCTION generate_financial_recommendations(p_user_id UUID)
RETURNS TABLE (
  recommendation_id UUID,
  title VARCHAR,
  description TEXT,
  type VARCHAR,
  impact_amount DECIMAL,
  priority VARCHAR
) AS $$
DECLARE
  v_total_subscriptions DECIMAL;
  v_monthly_avg_spending DECIMAL;
  v_emergency_fund_progress DECIMAL;
BEGIN
  -- Calcular total de suscripciones
  SELECT COALESCE(SUM(amount), 0) INTO v_total_subscriptions
  FROM recurring_transactions
  WHERE user_id = p_user_id 
    AND type = 'subscription' 
    AND is_active = TRUE;
  
  -- Si hay muchas suscripciones, recomendar optimizar
  IF v_total_subscriptions > 50 THEN
    INSERT INTO financial_recommendations (user_id, title, description, type, impact_amount, priority)
    VALUES (
      p_user_id,
      'Revisar y optimizar suscripciones',
      'Tienes ' || (SELECT COUNT(*) FROM recurring_transactions WHERE user_id = p_user_id AND type = 'subscription')::TEXT || 
      ' suscripciones activas gastando $' || ROUND(v_total_subscriptions, 2)::TEXT || ' mensuales. Considera cancelar las que no uses.',
      'subscription_review',
      v_total_subscriptions * 0.2,
      'high'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN QUERY
  SELECT 
    fr.id,
    fr.title,
    fr.description,
    fr.type,
    fr.impact_amount,
    fr.priority
  FROM financial_recommendations fr
  WHERE fr.user_id = p_user_id 
    AND fr.is_read = FALSE
    AND (fr.expires_at IS NULL OR fr.expires_at > CURRENT_TIMESTAMP)
  ORDER BY fr.priority DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN: Obtener gastos del mes anterior (comparativa)
-- =====================================================
CREATE OR REPLACE FUNCTION get_expenses_comparison(p_user_id UUID)
RETURNS TABLE (
  category_name VARCHAR,
  current_month DECIMAL,
  previous_month DECIMAL,
  difference DECIMAL,
  percentage_change DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.name,
    COALESCE(SUM(t1.amount), 0)::DECIMAL,
    COALESCE(SUM(t2.amount), 0)::DECIMAL,
    (COALESCE(SUM(t1.amount), 0) - COALESCE(SUM(t2.amount), 0))::DECIMAL,
    CASE 
      WHEN COALESCE(SUM(t2.amount), 0) > 0 THEN
        ROUND(((COALESCE(SUM(t1.amount), 0) - COALESCE(SUM(t2.amount), 0)) / COALESCE(SUM(t2.amount), 0)) * 100, 2)::DECIMAL
      ELSE 0
    END
  FROM transaction_categories tc
  LEFT JOIN transactions t1 ON tc.id = t1.category_id 
    AND t1.user_id = p_user_id 
    AND t1.type = 'expense'
    AND DATE_TRUNC('month', t1.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    AND t1.deleted_at IS NULL
  LEFT JOIN transactions t2 ON tc.id = t2.category_id 
    AND t2.user_id = p_user_id 
    AND t2.type = 'expense'
    AND DATE_TRUNC('month', t2.transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND t2.deleted_at IS NULL
  WHERE tc.user_id = p_user_id AND tc.type = 'expense'
  GROUP BY tc.id, tc.name
  ORDER BY current_month DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN: Actualizar próxima fecha de pago recurrente
-- =====================================================
CREATE OR REPLACE FUNCTION update_next_payment_date(p_recurring_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_next_date DATE;
  v_frequency VARCHAR;
  v_due_day INTEGER;
  v_current_year INTEGER;
  v_current_month INTEGER;
BEGIN
  SELECT frequency, due_day_of_month INTO v_frequency, v_due_day
  FROM recurring_transactions
  WHERE id = p_recurring_id;
  
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  v_current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
  
  -- Calcular próxima fecha según frecuencia
  CASE v_frequency
    WHEN 'weekly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '7 days';
    WHEN 'biweekly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '14 days';
    WHEN 'monthly' THEN
      v_next_date := DATE(v_current_year || '-' || LPAD(v_current_month::TEXT, 2, '0') || '-' || LPAD(v_due_day::TEXT, 2, '0'));
      IF v_next_date <= CURRENT_DATE THEN
        v_next_date := v_next_date + INTERVAL '1 month';
      END IF;
    WHEN 'quarterly' THEN
      v_next_date := CURRENT_DATE + INTERVAL '3 months';
    WHEN 'semiannual' THEN
      v_next_date := CURRENT_DATE + INTERVAL '6 months';
    WHEN 'annual' THEN
      v_next_date := CURRENT_DATE + INTERVAL '1 year';
  END CASE;
  
  UPDATE recurring_transactions
  SET next_payment_date = v_next_date
  WHERE id = p_recurring_id;
  
  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNCIÓN: Generar recordatorios de pago automáticos
-- =====================================================
CREATE OR REPLACE FUNCTION generate_payment_reminders()
RETURNS TABLE (
  reminder_count INTEGER
) AS $$
DECLARE
  v_count INTEGER := 0;
  v_reminder_id UUID;
BEGIN
  FOR v_reminder_id IN 
    SELECT rt.id
    FROM recurring_transactions rt
    WHERE rt.is_active = TRUE
      AND rt.next_payment_date = (CURRENT_DATE + (rt.notification_days_before || ' days')::INTERVAL)
      AND NOT EXISTS (
        SELECT 1 FROM payment_reminders pr
        WHERE pr.recurring_transaction_id = rt.id
          AND pr.reminder_date = (CURRENT_DATE + (rt.notification_days_before || ' days')::INTERVAL)
      )
  LOOP
    INSERT INTO payment_reminders (user_id, recurring_transaction_id, reminder_date)
    SELECT user_id, v_reminder_id, CURRENT_DATE + INTERVAL '2 days'
    FROM recurring_transactions
    WHERE id = v_reminder_id;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. FUNCIÓN: Obtener historial de transacciones filtrado
-- =====================================================
CREATE OR REPLACE FUNCTION get_transaction_history(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_type VARCHAR DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  description TEXT,
  category_name VARCHAR,
  amount DECIMAL,
  type VARCHAR,
  transaction_date DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.description,
    tc.name,
    t.amount,
    t.type,
    t.transaction_date,
    t.note,
    t.created_at
  FROM transactions t
  LEFT JOIN transaction_categories tc ON t.category_id = tc.id
  WHERE t.user_id = p_user_id 
    AND t.deleted_at IS NULL
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
    AND (p_type IS NULL OR t.type = p_type)
    AND (p_category_id IS NULL OR t.category_id = p_category_id)
  ORDER BY t.transaction_date DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. FUNCIÓN: Exportar datos para análisis
-- =====================================================
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS TABLE (
  data_type VARCHAR,
  record_count INTEGER,
  date_range TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'transactions'::VARCHAR,
    COUNT(*)::INTEGER,
    (SELECT MIN(transaction_date)::TEXT || ' to ' || MAX(transaction_date)::TEXT FROM transactions WHERE user_id = p_user_id AND deleted_at IS NULL)
  FROM transactions 
  WHERE user_id = p_user_id AND deleted_at IS NULL
  
  UNION ALL
  
  SELECT 
    'recurring_transactions'::VARCHAR,
    COUNT(*)::INTEGER,
    NULL
  FROM recurring_transactions 
  WHERE user_id = p_user_id AND deleted_at IS NULL
  
  UNION ALL
  
  SELECT 
    'savings_goals'::VARCHAR,
    COUNT(*)::INTEGER,
    NULL
  FROM savings_goals 
  WHERE user_id = p_user_id AND deleted_at IS NULL
  
  UNION ALL
  
  SELECT 
    'budgets'::VARCHAR,
    COUNT(*)::INTEGER,
    NULL
  FROM budgets 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DE FUNCIONES SQL
-- =====================================================
