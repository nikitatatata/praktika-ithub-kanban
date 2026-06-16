// Конфигурация ролей
const roleConfig = {
    user: {
        name: "Иван Иванов",
        role: "Пользователь",
        initials: "ИИ",
        menu: [
            { id: 'dashboard', icon: 'fa-house', label: 'Главная' },
            { id: 'applications', icon: 'fa-clipboard-list', label: 'Мои заявки' },
            { id: 'donations', icon: 'fa-heart', label: 'Мои пожертвования' },
            { id: 'favorites', icon: 'fa-star', label: 'Избранное' }
        ]
    },
    partner: {
        name: "Приют 'Дружок'",
        role: "Партнёр (Приют)",
        initials: "ПД",
        menu: [
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Статистика' },
            { id: 'animals', icon: 'fa-paw', label: 'Мои животные' },
            { id: 'applications', icon: 'fa-users', label: 'Заявки на усыновление' },
            { id: 'fundraising', icon: 'fa-hand-holding-dollar', label: 'Сборы средств' },
            { id: 'reports', icon: 'fa-file-invoice', label: 'Отчётность' }
        ]
    }
};

// Моковые данные
const mockData = {
    user: {
        applications: [
            { id: 1, animal: "Барни", type: "Собака", date: "15.06.2026", status: "review" },
            { id: 2, animal: "Муся", type: "Кошка", date: "10.06.2026", status: "approved" }
        ],
        donations: [
            { id: 1, animal: "Рекс", amount: 1000, date: "12.06.2026" },
            { id: 2, animal: "Приют 'Дружок'", amount: 3000, date: "05.06.2026" }
        ]
    },
    partner: {
        animals: [
            { id: 1, name: "Барни", type: "Собака", age: "2 года", status: "available", applications: 3 },
            { id: 2, name: "Муся", type: "Кошка", age: "1 год", status: "adopted", applications: 0 },
            { id: 3, name: "Рекс", type: "Собака", age: "4 года", status: "treatment", applications: 1 }
        ],
        applications: [
            { id: 1, animal: "Барни", user: "Иван Иванов", phone: "+7 (999) 123-45-67", date: "15.06.2026", status: "new" },
            { id: 2, animal: "Рекс", user: "Анна Смирнова", phone: "+7 (999) 987-65-43", date: "14.06.2026", status: "review" }
        ],
        fundraising: [
            { id: 1, title: "Операция для кота Муся", goal: 50000, collected: 35000, status: "active" },
            { id: 2, title: "Корм на июнь", goal: 30000, collected: 30000, status: "completed" }
        ]
    }
};

let currentRole = 'user';
let currentTab = 'dashboard';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    switchRole('user');
});

// Смена роли
function switchRole(role) {
    currentRole = role;
    const config = roleConfig[role];
    
    document.getElementById('userName').textContent = config.name;
    document.getElementById('userRole').textContent = config.role;
    document.getElementById('userAvatar').textContent = config.initials;
    
    const nav = document.getElementById('sidebarNav');
    nav.innerHTML = config.menu.map((item, index) => `
        <a href="#" class="nav-item ${index === 0 ? 'active' : ''}" 
           onclick="switchTab('${item.id}', '${item.label}'); return false;">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
        </a>
    `).join('');
    
    switchTab(config.menu[0].id, config.menu[0].label);
}

// Смена вкладки
function switchTab(tabId, title) {
    currentTab = tabId;
    document.getElementById('pageTitle').textContent = title;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        }
    });
    
    renderContent(tabId);
}

// Рендер контента
function renderContent(tabId) {
    const content = document.getElementById('mainContent');
    
    // ==================== ПОЛЬЗОВАТЕЛЬ ====================
    if (currentRole === 'user') {
        if (tabId === 'dashboard') {
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card" style="border-left-color: #3b82f6;">
                        <h3>Активные заявки</h3>
                        <div class="value">${mockData.user.applications.filter(a => a.status !== 'approved').length}</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #10b981;">
                        <h3>Одобрено</h3>
                        <div class="value">${mockData.user.applications.filter(a => a.status === 'approved').length}</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #f97316;">
                        <h3>Пожертвований</h3>
                        <div class="value">${mockData.user.donations.length}</div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">Последние заявки</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>Тип</th>
                                    <th>Дата подачи</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.user.applications.map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.type}</td>
                                        <td>${app.date}</td>
                                        <td>${getStatusBadge(app.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">Быстрые действия</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <a href="#" class="quick-action-card" onclick="alert('Открытие каталога животных'); return false;">
                            <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--primary);"></i>
                            <h3>Найти питомца</h3>
                            <p>Просмотреть доступных животных</p>
                        </a>
                        <a href="#" class="quick-action-card" onclick="alert('Открытие сборов'); return false;">
                            <i class="fa-solid fa-hand-holding-dollar" style="font-size: 2rem; color: var(--secondary);"></i>
                            <h3>Пожертвовать</h3>
                            <p>Поддержать приют или животное</p>
                        </a>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'applications') {
            content.innerHTML = `
                <div class="card">
                    <h2 class="card-title">Мои заявки на усыновление</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>Тип</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.user.applications.map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.type}</td>
                                        <td>${app.date}</td>
                                        <td>${getStatusBadge(app.status)}</td>
                                        <td>
                                            <button class="btn btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">
                                                <i class="fa-solid fa-eye"></i>
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
        else if (tabId === 'donations') {
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card" style="border-left-color: #f97316;">
                        <h3>Всего пожертвовано</h3>
                        <div class="value">${mockData.user.donations.reduce((sum, d) => sum + d.amount, 0)} ₽</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #10b981;">
                        <h3>Помощи оказано</h3>
                        <div class="value">${mockData.user.donations.length}</div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">История пожертвований</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Получатель</th>
                                    <th>Сумма</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.user.donations.map(d => `
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
                        <p style="margin-bottom: 1rem; color: var(--gray-600);">Выберите сумму пожертвования:</p>
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
        else if (tabId === 'favorites') {
            content.innerHTML = `
                <div class="card">
                    <h2 class="card-title">Избранные животные</h2>
                    <p style="color: var(--gray-600); text-align: center; padding: 2rem;">
                        <i class="fa-regular fa-heart" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
                        У вас пока нет избранных животных
                    </p>
                </div>
            `;
        }
    }
    
    // ==================== ПАРТНЁР ====================
    else if (currentRole === 'partner') {
        if (tabId === 'dashboard') {
            const animals = mockData.partner.animals;
            const apps = mockData.partner.applications;
            
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card" style="border-left-color: #3b82f6;">
                        <h3>Всего животных</h3>
                        <div class="value">${animals.length}</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #10b981;">
                        <h3>Ищут дом</h3>
                        <div class="value">${animals.filter(a => a.status === 'available').length}</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #f97316;">
                        <h3>Новых заявок</h3>
                        <div class="value">${apps.filter(a => a.status === 'new').length}</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #8b5cf6;">
                        <h3>На лечении</h3>
                        <div class="value">${animals.filter(a => a.status === 'treatment').length}</div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">Последние заявки на усыновление</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>Кандидат</th>
                                    <th>Телефон</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${apps.slice(0, 3).map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.user}</td>
                                        <td>${app.phone}</td>
                                        <td>${app.date}</td>
                                        <td>${getStatusBadge(app.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'animals') {
            content.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 class="card-title" style="margin: 0;">Мои животные</h2>
                    <button class="btn btn-primary" onclick="alert('Добавление нового животного')">
                        <i class="fa-solid fa-plus"></i> Добавить животное
                    </button>
                </div>

                <div class="card">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Имя</th>
                                    <th>Тип</th>
                                    <th>Возраст</th>
                                    <th>Статус</th>
                                    <th>Заявок</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.partner.animals.map(animal => `
                                    <tr>
                                        <td><strong>${animal.name}</strong></td>
                                        <td>${animal.type}</td>
                                        <td>${animal.age}</td>
                                        <td>${getAnimalStatusBadge(animal.status)}</td>
                                        <td>${animal.applications}</td>
                                        <td>
                                            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                                <i class="fa-solid fa-pen"></i>
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
                    <h2 class="card-title">Заявки на усыновление</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Животное</th>
                                    <th>Кандидат</th>
                                    <th>Контакты</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mockData.partner.applications.map(app => `
                                    <tr>
                                        <td><strong>${app.animal}</strong></td>
                                        <td>${app.user}</td>
                                        <td>${app.phone}</td>
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
                </div>
            `;
        }
        else if (tabId === 'fundraising') {
            content.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 class="card-title" style="margin: 0;">Сборы средств</h2>
                    <button class="btn btn-primary" onclick="alert('Создание нового сбора')">
                        <i class="fa-solid fa-plus"></i> Создать сбор
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                    ${mockData.partner.fundraising.map(fund => `
                        <div class="card">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <div>
                                    <span class="badge ${fund.status === 'active' ? 'badge-warning' : 'badge-success'}">
                                        ${fund.status === 'active' ? 'Активен' : 'Завершён'}
                                    </span>
                                    <h3 style="margin: 0.5rem 0 0.25rem; font-size: 1.125rem;">${fund.title}</h3>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                <span style="font-weight: 600; color: var(--secondary);">Собрано: ${fund.collected} ₽</span>
                                <span style="color: var(--gray-600);">Цель: ${fund.goal} ₽</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(fund.collected / fund.goal * 100)}%;"></div>
                            </div>
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                <button class="btn btn-outline" style="flex: 1; padding: 0.5rem;" onclick="alert('Редактирование сбора')">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn btn-outline" style="flex: 1; padding: 0.5rem;" onclick="alert('Отчёт по сбору')">
                                    <i class="fa-solid fa-file-invoice"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        else if (tabId === 'reports') {
            content.innerHTML = `
                <div class="card">
                    <h2 class="card-title">Отчётность</h2>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <i class="fa-solid fa-file-pdf" style="font-size: 1.5rem; color: #dc2626;"></i>
                                <div>
                                    <div style="font-weight: 600;">Отчёт за Июнь 2026</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Пожертвования и расходы</div>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="padding: 0.5rem 1rem;">Скачать</button>
                        </div>
                        <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <i class="fa-solid fa-file-pdf" style="font-size: 1.5rem; color: #dc2626;"></i>
                                <div>
                                    <div style="font-weight: 600;">Отчёт за Май 2026</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Пожертвования и расходы</div>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="padding: 0.5rem 1rem;">Скачать</button>
                        </div>
                    </div>
                </div>
            `;
        }
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
        'available': '<span class="badge-success">Ищет дом</span>',
        'adopted': '<span class="badge-secondary">Усыновлён</span>',
        'treatment': '<span class="badge-warning">На лечении</span>'
    };
    return badges[status] || status;
}

function selectDonation(amount) {
    alert(`Выбрана сумма: ${amount} ₽\nВ реальной версии откроется форма оплаты.`);
}

function showQuickAction() {
    if (currentRole === 'user') {
        alert('Быстрые действия:\n• Найти питомца\n• Пожертвовать\n• Подать заявку');
    } else {
        alert('Быстрые действия:\n• Добавить животное\n• Создать сбор\n• Посмотреть заявки');
    }
}