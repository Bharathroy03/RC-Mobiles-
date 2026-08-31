import os
from models import db, StoreSettings, Product

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_default_data()

def seed_default_data():
    # 1. Initialize Store Settings if empty
    settings = StoreSettings.query.first()
    if not settings:
        settings = StoreSettings(
            store_name="RC Mobiles",
            address="NTR Circle, Madakasira, Ananthapur (Sri Sathya Sai district region), Andhra Pradesh 515301",
            gstin="37APVPR6953F1Z1",
            phone="+91 98490 12345",
            email="rcmobiles.madakasira@gmail.com",
            terms="1. Goods once sold will not be taken back or exchanged without valid invoice.\n2. Warranty claims are governed strictly by original manufacturer policy.\n3. Physical damage, liquid damage & unauthorized repairs void warranty.\n4. Subject to Madakasira Jurisdiction.",
            logo_path="/api/uploads/logo.png",
            invoice_prefix="RCM",
            invoice_counter=1001
        )
        db.session.add(settings)
        db.session.commit()
    else:
        # Ensure correct details
        settings.store_name = "RC Mobiles"
        settings.address = "NTR Circle, Madakasira, Ananthapur (Sri Sathya Sai district region), Andhra Pradesh 515301"
        settings.gstin = "37APVPR6953F1Z1"
        db.session.commit()

    # 2. Seed initial sample catalog if no products exist
    if Product.query.count() == 0:
        sample_products = [
            Product(name="Apple iPhone 15 (128GB) Black", brand="Apple", category="Mobile", hsn_code="8517", purchase_price=58000, selling_price=64900, stock_qty=5, tax_rate=18.0),
            Product(name="Samsung Galaxy S24 5G (256GB)", brand="Samsung", category="Mobile", hsn_code="8517", purchase_price=72000, selling_price=79999, stock_qty=3, tax_rate=18.0),
            Product(name="Redmi Note 13 Pro 5G (128GB)", brand="Xiaomi", category="Mobile", hsn_code="8517", purchase_price=19000, selling_price=21999, stock_qty=8, tax_rate=18.0),
            Product(name="Realme 12 Pro+ 5G (256GB)", brand="Realme", category="Mobile", hsn_code="8517", purchase_price=26000, selling_price=29999, stock_qty=6, tax_rate=18.0),
            Product(name="OnePlus Nord CE 4 5G (128GB)", brand="OnePlus", category="Mobile", hsn_code="8517", purchase_price=22000, selling_price=24999, stock_qty=7, tax_rate=18.0),
            Product(name="Vivo V30 5G (128GB)", brand="Vivo", category="Mobile", hsn_code="8517", purchase_price=29000, selling_price=33999, stock_qty=4, tax_rate=18.0),
            Product(name="Apple 20W USB-C Power Adapter", brand="Apple", category="Accessory", hsn_code="8504", purchase_price=1400, selling_price=1900, stock_qty=15, tax_rate=18.0),
            Product(name="boAt Airdopes 141 TWS Earbuds", brand="boAt", category="Audio", hsn_code="8518", purchase_price=850, selling_price=1299, stock_qty=20, tax_rate=18.0),
            Product(name="Type-C 65W Fast Charging Cable 1M", brand="Generic", category="Accessory", hsn_code="8544", purchase_price=120, selling_price=350, stock_qty=30, tax_rate=18.0),
            Product(name="11D Curved Tempered Glass Guard", brand="Generic", category="Accessory", hsn_code="7007", purchase_price=50, selling_price=250, stock_qty=50, tax_rate=18.0),
            Product(name="Silicone Armor Protective Back Case", brand="Generic", category="Accessory", hsn_code="3926", purchase_price=60, selling_price=299, stock_qty=40, tax_rate=18.0)
        ]
        db.session.bulk_save_objects(sample_products)
        db.session.commit()
