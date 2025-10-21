// Статусы профилей
export const PROFILE_STATUSES = {
  personal: [
    { value: 'active', label: 'Активный', color: '#10B981', icon: 'fa-check-circle' },
    { value: 'inactive', label: 'Неактивный', color: '#6B7280', icon: 'fa-pause-circle' },
    { value: 'banned', label: 'Заблокирован', color: '#EF4444', icon: 'fa-ban' },
    { value: 'pending', label: 'На проверке', color: '#F59E0B', icon: 'fa-clock' }
  ],
  for_sale: [
    { value: 'active', label: 'Активный', color: '#10B981', icon: 'fa-check-circle' },
    { value: 'inactive', label: 'Неактивный', color: '#6B7280', icon: 'fa-pause-circle' },
    { value: 'banned', label: 'Заблокирован', color: '#EF4444', icon: 'fa-ban' },
    { value: 'pending', label: 'На проверке', color: '#F59E0B', icon: 'fa-clock' },
    { value: 'sold', label: 'Продан', color: '#8B5CF6', icon: 'fa-dollar-sign' }
  ]
};

// Статусы верификации
export const VERIFICATION_STATUSES = [
  { value: 'verified', label: 'Верифицирован', color: '#10B981' },
  { value: 'unverified', label: 'Не верифицирован', color: '#EF4444' },
  { value: 'pending', label: 'В процессе', color: '#F59E0B' }
];

// Статусы регистрации
export const REGISTRATION_STATUSES = [
  { value: 'completed', label: 'Завершена' },
  { value: 'pending', label: 'В процессе' },
  { value: 'failed', label: 'Ошибка' }
];

// Статусы email
export const EMAIL_STATUSES = [
  { value: 'free', label: 'Свободен', color: '#10B981' },
  { value: 'used', label: 'Использован', color: '#6B7280' },
  { value: 'blocked', label: 'Заблокирован', color: '#EF4444' }
];

// Типы полей
export const FIELD_TYPES = [
  { value: 'text', label: 'Текст', icon: 'fa-font' },
  { value: 'number', label: 'Число', icon: 'fa-hashtag' },
  { value: 'select', label: 'Выпадающий список', icon: 'fa-list' },
  { value: 'date', label: 'Дата', icon: 'fa-calendar' },
  { value: 'textarea', label: 'Текстовая область', icon: 'fa-align-left' }
];

// Категории профилей
export const PROFILE_CATEGORIES = [
  { value: 'personal', label: 'Личные профили', icon: 'fa-user', color: '#3B82F6' },
  { value: 'for_sale', label: 'Профили для продажи', icon: 'fa-dollar-sign', color: '#10B981' }
];

// Страны (список для выпадающих списков)
export const COUNTRIES = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Азербайджан",
  "Армения", "Грузия", "Молдавия", "Узбекистан", "Киргизия",
  "Таджикистан", "Туркменистан", "Латвия", "Литва", "Эстония",
  "Польша", "Чехия", "Словакия", "Венгрия", "Румыния",
  "Болгария", "Германия", "Франция", "Италия", "Испания",
  "Великобритания", "США", "Канада", "Китай", "Япония",
  "Южная Корея", "Турция", "Индия", "Бразилия", "Австралия"
];

// Разрешенные типы файлов для загрузки
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp'
];

// Максимальный размер файла (16MB)
export const MAX_FILE_SIZE = 16 * 1024 * 1024;

// Настройки пагинации
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizes: [10, 20, 50, 100]
};

// Ключи для локального хранилища
export const STORAGE_KEYS = {
  THEME: 'theme',
  TOKEN: 'token',
  USER: 'user',
  VIEW_MODE: 'profileViewMode',
  FAVORITES: 'profileFavorites'
};

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Доступ запрещен.',
  NOT_FOUND: 'Ресурс не найден.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Проверьте правильность введенных данных.'
};