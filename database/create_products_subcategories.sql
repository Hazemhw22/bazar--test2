-- إنشاء جدول سوب كاتيجوري المنتجات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS products_sub_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id INTEGER REFERENCES products_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة عمود sub_category_id لجدول المنتجات إذا لم يكن موجوداً
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES products_sub_categories(id);

-- إدراج بيانات تجريبية لسوب كاتيجوري المنتجات
INSERT INTO products_sub_categories (name, description, category_id, image_url) 
SELECT * FROM (VALUES
    -- إلكترونيات (category_id = 1)
    ('هواتف ذكية', 'هواتف محمولة وإكسسوارات', 1, '/subcategories/phones.jpg'),
    ('حاسوب ولابتوب', 'أجهزة كمبيوتر محمولة ومكتبية', 1, '/subcategories/computers.jpg'),
    ('أجهزة منزلية', 'أجهزة كهربائية للمنزل', 1, '/subcategories/appliances.jpg'),
    ('كاميرات', 'كاميرات تصوير ومعدات', 1, '/subcategories/cameras.jpg'),
    
    -- ملابس وأزياء (category_id = 2)
    ('ملابس رجالية', 'ملابس وإكسسوارات للرجال', 2, '/subcategories/mens.jpg'),
    ('ملابس نسائية', 'ملابس وإكسسوارات للنساء', 2, '/subcategories/womens.jpg'),
    ('ملابس أطفال', 'ملابس وإكسسوارات للأطفال', 2, '/subcategories/kids.jpg'),
    ('أحذية', 'أحذية للجميع', 2, '/subcategories/shoes.jpg'),
    
    -- منزل وحديقة (category_id = 3)
    ('أثاث', 'أثاث منزلي ومكتبي', 3, '/subcategories/furniture.jpg'),
    ('ديكور', 'قطع ديكور ومستلزمات تزيين', 3, '/subcategories/decor.jpg'),
    ('أدوات منزلية', 'أدوات وأجهزة منزلية', 3, '/subcategories/tools.jpg'),
    ('حديقة', 'مستلزمات الحديقة والنباتات', 3, '/subcategories/garden.jpg'),
    
    -- صحة وجمال (category_id = 4)
    ('عناية بالبشرة', 'منتجات العناية بالبشرة', 4, '/subcategories/skincare.jpg'),
    ('مكياج وتجميل', 'مستحضرات التجميل والمكياج', 4, '/subcategories/makeup.jpg'),
    ('عطور', 'عطور ومنتجات عطرية', 4, '/subcategories/perfumes.jpg'),
    ('صحة عامة', 'منتجات الصحة والعافية', 4, '/subcategories/health.jpg'),
    
    -- رياضة ولياقة (category_id = 5)
    ('معدات رياضية', 'أجهزة ومعدات رياضية', 5, '/subcategories/equipment.jpg'),
    ('ملابس رياضية', 'ملابس وأحذية رياضية', 5, '/subcategories/sportswear.jpg'),
    ('مكملات غذائية', 'مكملات غذائية رياضية', 5, '/subcategories/supplements.jpg'),
    ('دراجات', 'دراجات هوائية ومعدات', 5, '/subcategories/bikes.jpg'),
    
    -- كتب ووسائط (category_id = 6)
    ('كتب', 'كتب ومجلات', 6, '/subcategories/books.jpg'),
    ('ألعاب فيديو', 'ألعاب الفيديو والكونسولات', 6, '/subcategories/games.jpg'),
    ('موسيقى', 'آلات موسيقية وتسجيلات', 6, '/subcategories/music.jpg'),
    ('أفلام', 'أفلام ومسلسلات', 6, '/subcategories/movies.jpg')
) AS v(name, description, category_id, image_url)
WHERE NOT EXISTS (
    SELECT 1 FROM products_sub_categories 
    WHERE products_sub_categories.name = v.name 
    AND products_sub_categories.category_id = v.category_id
);

-- تحديث بعض المنتجات لتكون لها سوب كاتيجوريات للاختبار
UPDATE products SET 
    sub_category_id = 1  -- هواتف ذكية
WHERE category_id = 1 AND sub_category_id IS NULL 
LIMIT 5;

UPDATE products SET 
    sub_category_id = 5  -- ملابس رجالية
WHERE category_id = 2 AND sub_category_id IS NULL 
LIMIT 3;

UPDATE products SET 
    sub_category_id = 9  -- أثاث
WHERE category_id = 3 AND sub_category_id IS NULL 
LIMIT 4;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON products(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_categories_category_id ON products_sub_categories(category_id);

-- تحديث الـ updated_at عند التعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة trigger للجدول إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_sub_categories_updated_at') THEN
        CREATE TRIGGER update_products_sub_categories_updated_at 
        BEFORE UPDATE ON products_sub_categories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- عرض النتائج للتحقق
SELECT 'Products with subcategories:' as info, COUNT(*) as count FROM products WHERE sub_category_id IS NOT NULL;
SELECT 'Total product subcategories:' as info, COUNT(*) as count FROM products_sub_categories;
SELECT 'Subcategories distribution:' as info, c.name as category, sc.name as subcategory, COUNT(p.id) as products_count 
FROM products_categories c 
LEFT JOIN products_sub_categories sc ON c.id = sc.category_id 
LEFT JOIN products p ON sc.id = p.sub_category_id 
GROUP BY c.id, c.name, sc.id, sc.name 
ORDER BY c.id, sc.id;
