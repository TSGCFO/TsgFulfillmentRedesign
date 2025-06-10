-- Employee Portal Database Migration
-- Execute these SQL commands in the exact order listed

-- Step 1: Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  quote_request_id INTEGER REFERENCES quote_requests(id),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NOT NULL,
  services_quoted JSONB NOT NULL,
  pricing_data JSONB NOT NULL,
  total_amount DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'draft',
  valid_until DATE,
  created_by INTEGER REFERENCES employees(id),
  assigned_to INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  hubspot_deal_id VARCHAR(100),
  notes TEXT
);

-- Step 3: Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  docusign_envelope_id VARCHAR(100),
  supabase_file_path VARCHAR(500),
  signed_date TIMESTAMP,
  expires_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_code VARCHAR(50) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  delivery_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  material_code VARCHAR(100) UNIQUE NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  reorder_point INTEGER DEFAULT 0,
  standard_cost DECIMAL(10,2),
  last_purchase_cost DECIMAL(10,2),
  preferred_vendor_id INTEGER REFERENCES vendors(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  vendor_id INTEGER REFERENCES vendors(id) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12,2),
  created_by INTEGER REFERENCES employees(id),
  approved_by INTEGER REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 7: Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 8: Create hubspot_sync_log table
CREATE TABLE IF NOT EXISTS hubspot_sync_log (
  id SERIAL PRIMARY KEY,
  record_type VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  hubspot_id VARCHAR(100),
  sync_action VARCHAR(50) NOT NULL,
  sync_status VARCHAR(50) NOT NULL,
  error_message TEXT,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Step 9: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_assigned_to ON quotes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contracts_quote_id ON contracts(quote_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_is_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_log_record ON hubspot_sync_log(record_type, record_id);

-- Step 10: Insert sample data (optional for testing)
-- Uncomment the following lines if you want to insert test data

-- Insert test user
-- INSERT INTO users (username, password, role) 
-- VALUES ('test.employee', '$2a$10$your_bcrypt_hash_here', 'sales_rep');

-- Insert test employee
-- INSERT INTO employees (user_id, employee_id, first_name, last_name, email, department, position, hire_date)
-- VALUES (1, 'EMP001', 'Test', 'Employee', 'test@tsgfulfillment.com', 'Sales', 'Sales Representative', '2025-01-01');

-- Insert test vendor
-- INSERT INTO vendors (vendor_name, vendor_code, contact_person, email, phone, address, is_active)
-- VALUES ('Sample Vendor Inc', 'VEN001', 'John Smith', 'john@samplevendor.com', '555-1234', '123 Main St, City, State', true);

-- Insert test material
-- INSERT INTO materials (material_code, material_name, category, unit_of_measure, current_stock, minimum_stock, reorder_point, is_active)
-- VALUES ('MAT001', 'Sample Material', 'Packaging', 'EA', 100, 10, 20, true);