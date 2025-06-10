-- Employee Portal Database Schema
-- Version: 1.0
-- Created: 2024

-- ============================================
-- 1. SALES TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  hubspot_owner_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. QUOTE INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quote_inquiries (
  id SERIAL PRIMARY KEY,
  quote_request_id INTEGER REFERENCES quote_requests(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES sales_team_members(id),
  hubspot_deal_id VARCHAR(255),
  hubspot_contact_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'medium',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CONTRACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  quote_inquiry_id INTEGER REFERENCES quote_inquiries(id),
  docusign_envelope_id VARCHAR(255) UNIQUE NOT NULL,
  supabase_file_path VARCHAR(500),
  supabase_file_url TEXT,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  contract_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. QUOTE VERSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quote_versions (
  id SERIAL PRIMARY KEY,
  quote_inquiry_id INTEGER REFERENCES quote_inquiries(id),
  version_number INTEGER NOT NULL,
  pricing_data JSONB NOT NULL,
  services JSONB NOT NULL,
  terms TEXT,
  valid_until DATE,
  created_by INTEGER REFERENCES sales_team_members(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit_of_measure VARCHAR(50),
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. VENDORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. MATERIAL INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS material_inventory (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100),
  last_counted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. MATERIAL PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS material_prices (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id),
  vendor_id INTEGER REFERENCES vendors(id),
  price DECIMAL(10, 2) NOT NULL,
  minimum_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  is_current BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. MATERIAL USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS material_usage (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id),
  quantity_used INTEGER NOT NULL,
  used_for VARCHAR(255),
  used_by INTEGER REFERENCES users(id),
  usage_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  order_date DATE,
  expected_delivery_date DATE,
  total_amount DECIMAL(10, 2),
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. PURCHASE ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  received_date DATE
);

-- ============================================
-- 12. HUBSPOT SYNC LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hubspot_sync_log (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_quote_inquiries_assigned_to ON quote_inquiries(assigned_to);
CREATE INDEX idx_quote_inquiries_status ON quote_inquiries(status);
CREATE INDEX idx_contracts_docusign_envelope_id ON contracts(docusign_envelope_id);
CREATE INDEX idx_materials_sku ON materials(sku);
CREATE INDEX idx_material_inventory_material_id ON material_inventory(material_id);
CREATE INDEX idx_hubspot_sync_log_entity ON hubspot_sync_log(entity_type, entity_id);

-- ============================================
-- UPDATE TIMESTAMP TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- APPLY UPDATE TIMESTAMP TRIGGERS
-- ============================================
CREATE TRIGGER update_sales_team_members_updated_at BEFORE UPDATE ON sales_team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_inquiries_updated_at BEFORE UPDATE ON quote_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_inventory_updated_at BEFORE UPDATE ON material_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();