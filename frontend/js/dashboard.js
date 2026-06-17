// Моковые данные
const mockData = {
    myAnimals: [
        { id: 1, name: "Барни", type: "Собака", breed: "Метис", age: "2 года", purpose: "free", status: "active", views: 45, date: "10.06.2026" },
        { id: 2, name: "Муся", type: "Кошка", breed: "Домашняя", age: "1 год", purpose: "fundraising", status: "active", views: 128, collected: 15000, goal: 30000, date: "05.06.2026" },
        { id: 3, name: "Рекс", type: "Собака", breed: "Овчарка", age: "4 года", purpose: "sale", status: "adopted", price: 5000, views: 89, date: "01.06.2026" }
    ],
    applications: [
        { id: 1, animal: "Котёнок Рыжик", from: "Анна Смирнова", phone: "+7 (999) 123-45-67", date: "15.06.2026", status: "new", message: "Хочу забрать котёнка, есть опыт содержания" },
        { id: 2, animal: "Собака Барни", from: "Петр Петров", phone: "+7 (999) 987-65-43", date: "14.06.2026", status: "review", message: "Готов забрать, есть частный дом" }
    ],
    favorites: [
        { id: 10, name: "Тузик", type: "Собака", age: "6 месяцев", purpose: "free", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80" },
        { id: 11, name: "Соня", type: "Кошка", age: "2 года", purpose: "free", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80" }
    ],
    donations: [
        { id: 1, animal: "Операция для кота Муся", amount: 1000, date: "12.06.2026" },
        { id: 2, animal: "Корм для приюта", amount: 2000, date: "08.06.2026" }
    ],
    allAnimals: [
        { id: 10, name: "Тузик", type: "dog", typeName: "Собака", breed: "Дворняжка", age: "6 месяцев", purpose: "free", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80", description: "Активный щенок, ищет любящую семью", location: "Москва" },
        { id: 11, name: "Соня", type: "cat", typeName: "Кошка", breed: "Сибирская", age: "2 года", purpose: "free", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80", description: "Ласковая кошка, стерилизована", location: "Санкт-Петербург" },
        { id: 12, name: "Кеша", type: "bird", typeName: "Птица", breed: "Попугай", age: "1 год", purpose: "sale", price: 3000, image: "https://images.unsplash.com/photo-1552728089-57bdde30ebd1?auto=format&fit=crop&w=500&q=80", description: "Говорящий попугай, очень умный", location: "Казань" }
    ]
};

const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Главная' },
    { id: 'my-animals', icon: 'fa-paw', label: 'Мои животные' },
    { id: 'applications', icon: 'fa-comments', label: 'Заявки' },
    { id: 'favorites', icon: 'fa-heart', label: 'Избранное' },
    { id: 'donations', icon: 'fa-hand-holding-dollar', label: 'Мои пожертвования' },
    { id: 'search', icon: 'fa-magnifying-glass', label: 'Поиск животных' }
];

let currentTab = 'dashboard';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    switchTab('dashboard');
});

// Рендер меню
function renderMenu() {
    const nav = document.getElementById('sidebarNav');
    const bottomNav = document.getElementById('bottomNav');
    
    // Десктопное меню
    if (nav) {
        nav.innerHTML = menuItems.map((item) => `
            <a href="#" class="nav-item ${item.id === currentTab ? 'active' : ''}" 
               onclick="switchTab('${item.id}', '${item.label}'); return false;">
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }
    
    // Мобильное меню (нижняя навигация)
    if (bottomNav) {
        // Показываем только основные пункты для мобильной навигации
        const mobileMenuItems = menuItems.slice(0, 5);
        bottomNav.innerHTML = mobileMenuItems.map((item) => `
            <a href="#" class="bottom-nav-item ${item.id === currentTab ? 'active' : ''}" 
               onclick="switchTab('${item.id}', '${item.label}'); return false;">
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }
}

// Смена вкладки
function switchTab(tabId, title) {
    currentTab = tabId;
    document.getElementById('pageTitle').textContent = title;
    
    // Обновляем активный класс в десктопном меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
    
    // Обновляем активный класс в мобильном меню
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
    
    renderContent(tabId);
    
    // Прокрутка вверх при смене вкладки
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Рендер контента
function renderContent(tabId) {
    const content = document.getElementById('mainContent');
    
    if (tabId === 'dashboard') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: #3b82f6;">
                    <h3>Мои объявления</h3>
                    <div class="value">${mockData.myAnimals.filter(a => a.status === 'active').length}</div>
                </div>
                <div class="stat-card" style="border-left-color: #10b981;">
                    <h3>Заявок получено</h3>
                    <div class="value">${mockData.applications.length}</div>
                </div>
                <div class="stat-card" style="border-left-color: #f97316;">
                    <h3>В избранном</h3>
                    <div class="value">${mockData.favorites.length}</div>
                </div>
                <div class="stat-card" style="border-left-color: #8b5cf6;">
                    <h3>Пожертвований</h3>
                    <div class="value">${mockData.donations.length}</div>
                </div>
            </div>

            <div class="card">
                <h2 class="card-title">Быстрые действия</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="quick-action-card" onclick="switchTab('my-animals', 'Мои животные')">
                        <i class="fa-solid fa-circle-plus" style="font-size: 2rem; color: var(--primary);"></i>
                        <h3>Разместить животное</h3>
                        <p>Отдать даром, продать или собрать средства</p>
                    </div>
                    <div class="quick-action-card" onclick="switchTab('search', 'Поиск животных')">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--secondary);"></i>
                        <h3>Найти питомца</h3>
                        <p>Ищите среди тысяч объявлений</p>
                    </div>
                    <div class="quick-action-card" onclick="switchTab('applications', 'Заявки')">
                        <i class="fa-solid fa-comments" style="font-size: 2rem; color: #10b981;"></i>
                        <h3>Проверить заявки</h3>
                        <p>${mockData.applications.filter(a => a.status === 'new').length} новых заявок</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <h2 class="card-title">Последние заявки</h2>
                ${mockData.applications.length > 0 ? `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>От кого</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.applications.slice(0, 3).map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.from}</td>
                                        <td>${app.date}</td>
                                        <td>${getStatusBadge(app.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p style="color: var(--gray-600); text-align: center; padding: 2rem;">Пока нет заявок</p>'}
            </div>
        `;
    }
    else if (tabId === 'my-animals') {
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 class="card-title" style="margin: 0;">Мои животные</h2>
                <button class="btn btn-primary" onclick="alert('Открытие формы добавления животного')">
                    <i class="fa-solid fa-plus"></i> Разместить объявление
                </button>
            </div>

            <div class="card">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Тип</th>
                                <th>Цель</th>
                                <th>Статус</th>
                                <th>Просмотры</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.myAnimals.map(animal => `
                                <tr>
                                    <td><strong>${animal.name}</strong></td>
                                    <td>${animal.type}</td>
                                    <td>${getPurposeBadge(animal.purpose, animal.price, animal.collected, animal.goal)}</td>
                                    <td>${getAnimalStatusBadge(animal.status)}</td>
                                    <td>${animal.views}</td>
                                    <td>${animal.date}</td>
                                    <td>
                                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;" onclick="alert('Редактирование')">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="alert('Удаление')">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    else if (tabId === 'applications') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Заявки на моих животных</h2>
                ${mockData.applications.length > 0 ? `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>От кого</th>
                                    <th>Контакты</th>
                                    <th>Сообщение</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.applications.map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.from}</td>
                                        <td>${app.phone}</td>
                                        <td><small>${app.message}</small></td>
                                        <td>${app.date}</td>
                                        <td>${getStatusBadge(app.status)}</td>
                                        <td>
                                            <button class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.25rem;" onclick="alert('Одобрение заявки')">
                                                <i class="fa-solid fa-check"></i>
                                            </button>
                                            <button class="btn btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="alert('Отклонение заявки')">
                                                <i class="fa-solid fa-xmark"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p style="color: var(--gray-600); text-align: center; padding: 2rem;">Пока нет заявок</p>'}
            </div>
        `;
    }
    else if (tabId === 'favorites') {
        content.innerHTML = `
            <h2 class="card-title" style="margin-bottom: 1.5rem;">Избранные животные</h2>
            <div class="animals-grid">
                ${mockData.favorites.map(animal => `
                    <div class="animal-card">
                        <img src="${animal.image}" alt="${animal.name}" class="animal-image">
                        <div class="animal-info">
                            <div class="animal-header">
                                <h3 class="animal-name">${animal.name}</h3>
                                <span class="animal-badge">${animal.type}</span>
                            </div>
                            <p class="animal-meta">${animal.age}</p>
                            <p class="animal-purpose">${getPurposeText(animal.purpose)}</p>
                            <div class="animal-actions">
                                <button class="btn-adopt" onclick="openAnimalDetailModal(${animal.id})">
                                    <i class="fa-solid fa-circle-info"></i> Подробнее
                                </button>
                                <button class="btn-donate" onclick="event.stopPropagation(); toggleDashboardFavoriteBtn(this, ${animal.id})">
                                    <i class="fa-regular fa-heart"></i>
                                </button>
</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    else if (tabId === 'donations') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: #f97316;">
                    <h3>Всего пожертвовано</h3>
                    <div class="value">${mockData.donations.reduce((sum, d) => sum + d.amount, 0)} ₽</div>
                </div>
                <div class="stat-card" style="border-left-color: #10b981;">
                    <h3>Помощи оказано</h3>
                    <div class="value">${mockData.donations.length}</div>
                </div>
            </div>

            <div class="card">
                <h2 class="card-title">История пожертвований</h2>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Цель</th>
                                <th>Сумма</th>
                                <th>Дата</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.donations.map(d => `
                                <tr>
                                    <td><strong>${d.animal}</strong></td>
                                    <td><strong>${d.amount} ₽</strong></td>
                                    <td>${d.date}</td>
                                    <td><span class="badge-success">✓ Оплачено</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <h2 class="card-title">Пожертвовать сейчас</h2>
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.5rem;">
                    <p style="margin-bottom: 1rem; color: var(--gray-600);">Выберите сумму:</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                        <button class="btn btn-outline" onclick="selectDonation(300)">300 ₽</button>
                        <button class="btn btn-outline" onclick="selectDonation(500)">500 ₽</button>
                        <button class="btn btn-outline" onclick="selectDonation(1000)">1000 ₽</button>
                        <button class="btn btn-outline" onclick="selectDonation(3000)">3000 ₽</button>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="alert('Открытие платёжной формы')">
                        <i class="fa-solid fa-heart"></i> Сделать пожертвование
                    </button>
                </div>
            </div>
        `;
    }
    else if (tabId === 'search') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Поиск животных</h2>
                <div class="search-box" style="margin-bottom: 2rem;">
                    <select id="searchType" class="form-control">
                        <option value="">Все виды</option>
                        <option value="dog">Собаки</option>
                        <option value="cat">Кошки</option>
                        <option value="bird">Птицы</option>
                    </select>
                    <select id="searchPurpose" class="form-control">
                        <option value="">Все цели</option>
                        <option value="free">Отдам даром</option>
                        <option value="sale">Продам</option>
                        <option value="fundraising">Сбор средств</option>
                    </select>
                    <button onclick="searchAnimals()" class="btn btn-primary">
                        <i class="fa-solid fa-search"></i> Искать
                    </button>
                </div>

                <div id="searchResults" class="animals-grid">
                    ${mockData.allAnimals.map(animal => `
                        <div class="animal-card">
                            <img src="${animal.image}" alt="${animal.name}" class="animal-image">
                            <div class="animal-info">
                                <div class="animal-header">
                                    <h3 class="animal-name">${animal.name}</h3>
                                    <span class="animal-badge">${animal.typeName}</span>
                                </div>
                                <p class="animal-meta">${animal.breed}, ${animal.age}</p>
                                <p class="animal-desc">${animal.description}</p>
                                <p class="animal-location"><i class="fa-solid fa-location-dot"></i> ${animal.location}</p>
                                <div class="animal-actions">
                                    <button class="btn-adopt" onclick="alert('Связаться с владельцем ${animal.name}')">
                                        <i class="fa-solid fa-phone"></i> Связаться
                                    </button>
                                    <button class="btn-donate" onclick="addToFavorites(${animal.id})">
                                        <i class="fa-regular fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Вспомогательные функции
function getStatusBadge(status) {
    const badges = {
        'new': '<span class="badge-warning">Новая</span>',
        'review': '<span class="badge-info">На рассмотрении</span>',
        'approved': '<span class="badge-success">Одобрена</span>',
        'rejected': '<span class="badge-error">Отклонена</span>'
    };
    return badges[status] || status;
}

function getAnimalStatusBadge(status) {
    const badges = {
        'active': '<span class="badge-success">Активно</span>',
        'adopted': '<span class="badge-secondary">Устроено</span>',
        'archived': '<span class="badge-secondary">Архив</span>'
    };
    return badges[status] || status;
}

function getPurposeBadge(purpose, price, collected, goal) {
    if (purpose === 'free') return '<span class="badge-success">Отдам даром</span>';
    if (purpose === 'sale') return `<span class="badge-info">${price} ₽</span>`;
    if (purpose === 'fundraising') {
        const percent = Math.round((collected / goal) * 100);
        return `<span class="badge-warning">Сбор: ${percent}%</span>`;
    }
    return purpose;
}

function getPurposeText(purpose) {
    const texts = {
        'free': 'Отдам даром',
        'sale': 'Продам',
        'fundraising': 'Сбор средств'
    };
    return texts[purpose] || purpose;
}

function addToFavorites(id) {
    alert('Добавлено в избранное!');
}

function removeFromFavorites(id) {
    if (confirm('Удалить из избранного?')) {
        alert('Удалено из избранного');
        switchTab('favorites');
    }
}

function selectDonation(amount) {
    alert(`Выбрана сумма: ${amount} ₽\nВ реальной версии откроется форма оплаты.`);
}

function searchAnimals() {
    alert('Поиск животных...\nВ реальной версии будет фильтрация по параметрам.');
}

function showQuickAction() {
    alert('Разместить:\n• Животное (отдать/продать/сбор)\n• Сбор средств\n• Искать питомца');
}

// Открытие детальной карточки животного (для dashboard)
function openAnimalDetailModal(animalId) {
    // Ищем животное во всех массивах
    let animal = mockData.myAnimals.find(a => a.id === animalId);
    if (!animal) {
        animal = mockData.allAnimals.find(a => a.id === animalId);
    }
    if (!animal) {
        animal = mockData.favorites.find(a => a.id === animalId);
    }
    
    if (!animal) return;
    
    const modal = document.getElementById('animalDetailModal');
    const modalContent = document.getElementById('animalDetailModalContent');
    
    // Генерация HTML
    let purposeHtml = '';
    if (animal.purpose === 'free') {
        purposeHtml = '<span class="purpose-badge purpose-free" style="font-size: 1rem; padding: 0.5rem 1rem;">Отдам даром</span>';
    } else if (animal.purpose === 'sale') {
        purposeHtml = `<span class="purpose-badge purpose-sale" style="font-size: 1rem; padding: 0.5rem 1rem;">${animal.price || 0} ₽</span>`;
    } else if (animal.purpose === 'fundraising') {
        const collected = animal.collected || 0;
        const goal = animal.goal || 100000;
        const percent = Math.round((collected / goal) * 100);
        purposeHtml = `
            <div class="fundraising-progress">
                <div class="fundraising-header">
                    <span class="fundraising-amount">Собрано: ${collected} ₽</span>
                    <span class="fundraising-goal">Цель: ${goal} ₽</span>
                </div>
                <div class="fundraising-bar">
                    <div class="fundraising-fill" style="width: ${percent}%"></div>
                </div>
                <div class="fundraising-percent">${percent}% собрано</div>
            </div>
        `;
    }
    
    const typeName = animal.typeName || animal.type;
    const breed = animal.breed || 'Не указана';
    const location = animal.location || 'Не указано';
    const description = animal.description || 'Описание не добавлено';
    
    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeAnimalDetailModal()">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="animal-detail">
            <div class="animal-detail-image">
                <img src="${animal.image || 'https://via.placeholder.com/500x500?text=Нет+фото'}" alt="${animal.name}">
                <div class="animal-detail-purpose">
                    ${purposeHtml}
                </div>
            </div>
            <div class="animal-detail-info">
                <div class="animal-detail-header">
                    <h2 class="animal-detail-name">${animal.name}</h2>
                    <div class="animal-detail-meta">
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-paw"></i>
                            <span>${typeName}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-certificate"></i>
                            <span>${breed}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-cake-candles"></i>
                            <span>${animal.age || 'Не указан'}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${location}</span>
                        </div>
                    </div>
                </div>

                <div class="animal-detail-section">
                    <h3><i class="fa-solid fa-circle-info"></i> О животном</h3>
                    <p class="animal-detail-description">${description}</p>
                </div>

                <div class="animal-detail-section">
                    <h3><i class="fa-solid fa-heart-pulse"></i> Здоровье и особенности</h3>
                    <div class="animal-detail-features">
                        <div class="feature-item">
                            <i class="fa-solid fa-scissors"></i>
                            <div>
                                <div class="feature-label">Стерилизация</div>
                                <div class="feature-value">Да</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="animal-detail-owner">
                    <div class="owner-info">
                        <div class="owner-avatar">И</div>
                        <div class="owner-details">
                            <h4>Иван Иванов</h4>
                            <p>На платформе с 2024 года</p>
                            <div class="owner-rating">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <span style="color: var(--gray-600); margin-left: 0.25rem;">5.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="animal-detail-actions">
                    <button class="btn-detail-primary" onclick="handleDashboardAdopt('${animal.name}')">
                        <i class="fa-solid fa-hand-holding-heart"></i>
                        ${animal.purpose === 'fundraising' ? 'Помочь' : 'Забрать'}
                    </button>
                    <button class="btn-detail-secondary" onclick="handleDashboardContact('${animal.name}')">
                        <i class="fa-solid fa-phone"></i>
                        Связаться
                    </button>
                    <button class="btn-detail-icon" onclick="toggleDashboardFavorite(this, ${animal.id})">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <button class="btn-detail-icon" onclick="shareAnimal(${animal.id})">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна в dashboard
function closeAnimalDetailModal() {
    const modal = document.getElementById('animalDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Обработчики для dashboard
function handleDashboardAdopt(animalName) {
    alert(`Заявка на "${animalName}" отправлена!`);
    closeAnimalDetailModal();
}

function handleDashboardContact(animalName) {
    alert(`Открываем чат с владельцем "${animalName}"`);
}

function toggleDashboardFavorite(btn, animalId) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        alert('Добавлено в избранное!');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        alert('Удалено из избранного');
    }
}

function toggleDashboardFavoriteBtn(btn, animalId) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        btn.style.background = '#fee2e2';
        btn.style.color = '#dc2626';
        alert('Добавлено в избранное!');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        btn.style.background = '';
        btn.style.color = '';
        alert('Удалено из избранного');
    }
}

// Мобильное быстрое действие
function showQuickAction() {
    if (window.innerWidth <= 768) {
        // На мобильных показываем простое меню
        const actions = [
            { label: 'Разместить животное', icon: 'fa-paw' },
            { label: 'Создать сбор средств', icon: 'fa-hand-holding-dollar' },
            { label: 'Найти питомца', icon: 'fa-magnifying-glass' }
        ];
        
        const actionText = actions.map((a, i) => `${i + 1}. ${a.label}`).join('\n');
        const choice = prompt(`Выберите действие:\n${actionText}\n\nВведите номер:`);
        
        if (choice === '1') {
            switchTab('my-animals', 'Мои животные');
        } else if (choice === '2') {
            alert('Создание сбора средств');
        } else if (choice === '3') {
            switchTab('search', 'Поиск животных');
        }
    } else {
        alert('Разместить:\n• Животное (отдать/продать/сбор)\n• Сбор средств\n• Искать питомца');
    }
}