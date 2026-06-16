// Конфигурация ролей
const roleConfig = {
    user: {
        name: "Иван Иванов",
        role: "Будущий владелец",
        initials: "ИИ",
        menu: [
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Мои заявки' },
            { id: 'catalog', icon: 'fa-dog', label: 'Каталог' },
            { id: 'donations', icon: 'fa-heart', label: 'Пожертвования' }
        ]
    },
    shelter: {
        name: "Приют 'Дружок'",
        role: "Представитель приюта",
        initials: "ПД",
        menu: [
            { id: 'shelter-dash', icon: 'fa-building', label: 'Статистика' },
            { id: 'animals', icon: 'fa-paw', label: 'Животные' },
            { id: 'requests', icon: 'fa-clipboard-list', label: 'Заявки' }
        ]
    },
    volunteer: {
        name: "Анна Смирнова",
        role: "Волонтёр",
        initials: "АС",
        menu: [
            { id: 'tasks', icon: 'fa-tasks', label: 'Мои задачи' },
            { id: 'schedule', icon: 'fa-calendar', label: 'Расписание' },
            { id: 'history', icon: 'fa-clock', label: 'История' }
        ]
    },
    donor: {
        name: "ООО 'Добро'",
        role: "Благотворитель",
        initials: "ОД",
        menu: [
            { id: 'donations', icon: 'fa-hand-holding-dollar', label: 'Мои вклады' },
            { id: 'reports', icon: 'fa-file-invoice', label: 'Отчёты' }
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
    
    // Обновляем активный пункт меню
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
    
    if (currentRole === 'user' && tabId === 'dashboard') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Отслеживание статуса усыновления</h2>
                <div class="status-tracker">
                    <div class="status-item completed">
                        <div class="status-icon"><i class="fa-solid fa-check"></i></div>
                        <div class="status-content">
                            <h4>Заявка отправлена</h4>
                            <p>15 июня 2026, 10:00</p>
                        </div>
                    </div>
                    <div class="status-item active">
                        <div class="status-icon"><i class="fa-solid fa-spinner fa-spin"></i></div>
                        <div class="status-content">
                            <h4>На рассмотрении приютом</h4>
                            <p>Ожидайте звонка в течение 2 дней</p>
                        </div>
                    </div>
                    <div class="status-item">
                        <div class="status-icon">3</div>
                        <div class="status-content">
                            <h4>Решение и передача</h4>
                            <p>Ожидается</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    else if (currentRole === 'shelter' && tabId === 'requests') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Входящие заявки на усыновление</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Животное</th>
                            <th>Кандидат</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Барни (Собака)</td>
                            <td>Иван Иванов<br><small>+7 (999) 123-45-67</small></td>
                            <td>15.06.2026</td>
                            <td><span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; font-weight: 600;">Новая</span></td>
                            <td>
                                <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Одобрить</button>
                                <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.875rem; margin-left: 0.5rem;">Отклонить</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    else if (currentRole === 'volunteer' && tabId === 'tasks') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: var(--primary);">
                    <h3>Активных задач</h3>
                    <div class="value">3</div>
                </div>
                <div class="stat-card" style="border-left-color: var(--secondary);">
                    <h3>Часов помощи</h3>
                    <div class="value">12 ч.</div>
                </div>
            </div>
            <div class="card">
                <h2 class="card-title">Актуальные задачи</h2>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="font-weight: 600; margin-bottom: 0.5rem;">🚶‍♂️ Выгул собак</h3>
                            <p style="color: var(--gray-600); font-size: 0.875rem;">Приют "Дружок" • Завтра, 10:00</p>
                        </div>
                        <button class="btn btn-primary">Записаться</button>
                    </div>
                    <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="font-weight: 600; margin-bottom: 0.5rem;">🧹 Уборка вольеров</h3>
                            <p style="color: var(--gray-600); font-size: 0.875rem;">Приют "Хвостик" • Суббота, 09:00</p>
                        </div>
                        <button class="btn btn-outline" disabled>✓ Записан</button>
                    </div>
                </div>
            </div>
        `;
    }
    else if (currentRole === 'donor' && tabId === 'donations') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Адресные сборы</h2>
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <span style="background: #fee2e2; color: #dc2626; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600;">Срочный сбор</span>
                            <h3 style="font-weight: 600; margin: 0.5rem 0;">Операция для кота Муся</h3>
                            <p style="color: var(--gray-600); font-size: 0.875rem;">Приют "Дружок"</p>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        <span style="font-weight: 600; color: var(--secondary);">Собрано: 35 000 ₽</span>
                        <span style="color: var(--gray-600);">Цель: 50 000 ₽</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%;"></div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;">Пожертвовать</button>
                </div>
            </div>
            <div class="card">
                <h2 class="card-title">Отчёты о расходовании</h2>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <i class="fa-solid fa-file-pdf" style="font-size: 1.5rem; color: #dc2626;"></i>
                            <div>
                                <div style="font-weight: 600;">Отчёт за Май 2026</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Приют "Дружок"</div>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="padding: 0.5rem 1rem;">Скачать</button>
                    </div>
                </div>
            </div>
        `;
    }
    else {
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: var(--gray-600);">
                <i class="fa-solid fa-person-digging" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Раздел в разработке</h2>
                <p>Здесь будет интерфейс для роли: <strong>${currentRole}</strong></p>
            </div>
        `;
    }
}

function showQuickAction() {
    alert('Быстрое действие\n\nВ реальной версии здесь откроется меню быстрых действий.');
}