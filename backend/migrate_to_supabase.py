import os
import sqlite3
import psycopg2

def run_migration(supabase_url):
    local_db_path = os.path.join(os.path.dirname(__file__), "rc_mobiles.db")
    if not os.path.exists(local_db_path):
        print("No local SQLite database found to migrate.")
        return True

    print("Connecting to Supabase PostgreSQL database for data migration...")
    if supabase_url.startswith("postgres://"):
        supabase_url = supabase_url.replace("postgres://", "postgresql://", 1)

    try:
        pg_conn = psycopg2.connect(supabase_url)
        pg_cur = pg_conn.cursor()

        sqlite_conn = sqlite3.connect(local_db_path)
        sqlite_cur = sqlite_conn.cursor()

        print("1. Migrating Store Settings...")
        sqlite_cur.execute("SELECT id, store_name, address, gstin, phone, email, terms, logo_path, invoice_prefix, invoice_counter FROM store_settings")
        settings_rows = sqlite_cur.fetchall()
        for r in settings_rows:
            pg_cur.execute("""
                INSERT INTO store_settings (id, store_name, address, gstin, phone, email, terms, logo_path, invoice_prefix, invoice_counter)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    store_name = EXCLUDED.store_name,
                    address = EXCLUDED.address,
                    gstin = EXCLUDED.gstin,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    terms = EXCLUDED.terms,
                    logo_path = EXCLUDED.logo_path,
                    invoice_prefix = EXCLUDED.invoice_prefix,
                    invoice_counter = EXCLUDED.invoice_counter;
            """, r)

        print("2. Migrating Products / Inventory...")
        sqlite_cur.execute("SELECT id, name, brand, category, hsn_code, purchase_price, selling_price, stock_qty, tax_rate, created_at FROM products")
        product_rows = sqlite_cur.fetchall()
        for r in product_rows:
            pg_cur.execute("""
                INSERT INTO products (id, name, brand, category, hsn_code, purchase_price, selling_price, stock_qty, tax_rate, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    brand = EXCLUDED.brand,
                    category = EXCLUDED.category,
                    selling_price = EXCLUDED.selling_price,
                    stock_qty = EXCLUDED.stock_qty;
            """, r)

        print("3. Migrating Invoices Master...")
        sqlite_cur.execute("""
            SELECT id, invoice_number, invoice_date, customer_name, customer_phone, customer_address, customer_gstin,
                   state_type, subtotal, discount_amount, taxable_amount, cgst_amount, sgst_amount, igst_amount,
                   total_tax, grand_total, payment_mode, payment_status, notes, created_at
            FROM invoices
        """)
        invoice_rows = sqlite_cur.fetchall()
        for r in invoice_rows:
            pg_cur.execute("""
                INSERT INTO invoices (id, invoice_number, invoice_date, customer_name, customer_phone, customer_address, customer_gstin,
                                      state_type, subtotal, discount_amount, taxable_amount, cgst_amount, sgst_amount, igst_amount,
                                      total_tax, grand_total, payment_mode, payment_status, notes, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (invoice_number) DO NOTHING;
            """, r)

        print("4. Migrating Invoice Line Items...")
        sqlite_cur.execute("""
            SELECT id, invoice_id, product_id, item_name, hsn_code, imei_serial, quantity, unit_price,
                   tax_rate, taxable_value, cgst_amount, sgst_amount, igst_amount, total_amount
            FROM invoice_items
        """)
        item_rows = sqlite_cur.fetchall()
        for r in item_rows:
            pg_cur.execute("""
                INSERT INTO invoice_items (id, invoice_id, product_id, item_name, hsn_code, imei_serial, quantity, unit_price,
                                           tax_rate, taxable_value, cgst_amount, sgst_amount, igst_amount, total_amount)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING;
            """, r)

        pg_conn.commit()

        # Reset Postgres primary key identity sequences
        for table in ['store_settings', 'products', 'invoices', 'invoice_items']:
            pg_cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1));")
        pg_conn.commit()

        pg_cur.close()
        pg_conn.close()
        sqlite_conn.close()

        print("SUCCESS: All local SQLite data migrated to Supabase PostgreSQL!")
        
        # Remove local SQLite database file
        try:
            os.remove(local_db_path)
            print("Local database file `rc_mobiles.db` deleted successfully.")
        except Exception as e:
            print(f"Notice: Could not remove local file: {e}")

        return True

    except Exception as err:
        print(f"Error during Supabase migration: {err}")
        return False

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    db_url = os.getenv("SUPABASE_DATABASE_URL") or os.getenv("DATABASE_URL")
    if db_url:
        run_migration(db_url)
    else:
        print("Please configure `SUPABASE_DATABASE_URL` in `backend/.env` first.")
