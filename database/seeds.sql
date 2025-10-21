-- Initial data for Profile Manager

-- Insert default categories
INSERT IGNORE INTO `categories` (`name`, `type`, `description`) VALUES
('Личные аккаунты', 'personal', 'Профили для личного использования'),
('Аккаунты для продажи', 'for_sale', 'Профили для коммерческой продажи');

-- Insert default statuses for personal category
INSERT IGNORE INTO `statuses` (`name`, `color`, `icon`, `category_type`, `display_order`, `description`) VALUES
('active', 'green', 'fa-check-circle', 'personal', 1, 'Активный профиль'),
('inactive', 'gray', 'fa-pause-circle', 'personal', 2, 'Неактивный профиль'),
('banned', 'red', 'fa-ban', 'personal', 3, 'Заблокированный профиль'),
('pending', 'yellow', 'fa-clock', 'personal', 4, 'Профиль на проверке');

-- Insert default statuses for for_sale category
INSERT IGNORE INTO `statuses` (`name`, `color`, `icon`, `category_type`, `display_order`, `description`) VALUES
('active', 'green', 'fa-check-circle', 'for_sale', 1, 'Активный профиль'),
('inactive', 'gray', 'fa-pause-circle', 'for_sale', 2, 'Неактивный профиль'),
('banned', 'red', 'fa-ban', 'for_sale', 3, 'Заблокированный профиль'),
('pending', 'yellow', 'fa-clock', 'for_sale', 4, 'Профиль на проверке'),
('sold', 'purple', 'fa-dollar-sign', 'for_sale', 5, 'Проданный профиль');

-- Insert default custom fields for for_sale category
INSERT IGNORE INTO `custom_fields` (`name`, `type`, `category_type`, `display_order`, `is_required`, `description`) VALUES
('price', 'number', 'for_sale', 1, FALSE, 'Цена продажи'),
('contact_info', 'text', 'for_sale', 2, FALSE, 'Контактная информация'),
('sale_notes', 'textarea', 'for_sale', 3, FALSE, 'Примечания к продаже');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO `users` (`username`, `password_hash`, `role`) VALUES
('admin', '$2a$10$8K1p/a0dRTlB0Z6b1UZQeOZ0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0', 'admin');

-- Insert default test user (password: user123)
INSERT IGNORE INTO `users` (`username`, `password_hash`, `role`) VALUES
('user1', '$2a$10$8K1p/a0dRTlB0Z6b1UZQeOZ0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0', 'user');

-- Insert sample emails
INSERT IGNORE INTO `emails` (`email`, `password`, `status`, `notes`) VALUES
('test1@gmail.com', 'password123', 'free', 'Тестовый email 1'),
('test2@yahoo.com', 'password123', 'free', 'Тестовый email 2'),
('test3@mail.ru', 'password123', 'free', 'Тестовый email 3'),
('used1@gmail.com', 'password123', 'used', 'Использованный email'),
('blocked1@yahoo.com', 'password123', 'blocked', 'Заблокированный email');