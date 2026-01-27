-- Insertar productos de prueba en el inventario
INSERT INTO inventario (nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
-- Bebidas
('Coca-Cola 400ml', 'Bebidas', 2000, 5000, 50, 10),
('Agua Cristal 500ml', 'Bebidas', 1000, 3000, 60, 15),
('Cerveza Corona', 'Bebidas', 3000, 8000, 40, 10),
('Red Bull', 'Bebidas', 3500, 9000, 30, 8),
('Gatorade', 'Bebidas', 2500, 6000, 25, 10),

-- Snacks
('Papas Margarita', 'Snacks', 1500, 4000, 45, 12),
('Chocolatina Jet', 'Snacks', 1200, 3500, 50, 15),
('Galletas Ducales', 'Snacks', 1800, 4500, 35, 10),
('Maní Moto', 'Snacks', 1000, 3000, 40, 10),

-- Otros
('Condones Durex', 'Varios', 3000, 8000, 30, 10),
('Toallas Húmedas', 'Higiene', 2000, 5000, 20, 8),
('Energizante Vive 100', 'Bebidas', 2000, 5000, 35, 12);
