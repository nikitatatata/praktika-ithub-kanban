// ==================== УТИЛИТЫ ====================

function checkAuth() {
    if (!API.Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Безопасное получение поля из объекта (регистронезависимо)
function getField(obj, ...names) {
    for (const name of names) {
        if (obj && obj[name] !== undefined && obj[name] !== null) {
            return obj[name];
        }
    }
    return '';
}

// ==================== ЗАГРУЗКА ПРОФИЛЯ ====================

async function loadUserProfile(forceRefresh = false) {
    const credentials = API.storage.getCredentials();
    if (!credentials || !credentials.userId) {
        console.warn('userId не найден');
        return;
    }
    
    try {
        let profile;
        
        if (forceRefresh) {
            console.log('🔄 Принудительная загрузка профиля...');
            profile = await API.User.getProfile(credentials.userId);
            console.log('📦 Получен профиль с сервера:', profile);
            console.log('📋 Все ключи профиля:', Object.keys(profile));
            API.storage.setUserData(profile);
        } else {
            profile = API.storage.getUserData();
            if (!profile || profile.id !== credentials.userId) {
                console.log('🔄 Кеш устарел, загружаем с сервера...');
                profile = await API.User.getProfile(credentials.userId);
                API.storage.setUserData(profile);
            }
        }
        
        // Получаем все возможные варианты написания полей
        const firstName = profile.FirstName || profile.firstname || profile.firstName || '';
        const surname = profile.Surname || profile.surname || profile.lastName || '';
        const lastname = profile.Lastname || profile.lastname || profile.middleName || '';
        const phone = profile.Phone || profile.phone || '';
        const location = profile.Location || profile.location || '';
        const description = profile.Description || profile.description || '';
        
        console.log('👤 Обработанные данные:', { 
            firstName, 
            surname, 
            lastname, 
            phone, 
            location, 
            description 
        });
        
        // Обновляем боковое меню
        const shortName = `${firstName} ${surname}`.trim() || 'Пользователь';
        document.getElementById('userName').textContent = shortName;
        document.getElementById('userRole').textContent = description || 'Пользователь';
        
        const initials = (firstName[0] || '') + (surname[0] || '');
        document.getElementById('userAvatar').textContent = initials || 'П';
        
        // Если мы на вкладке профиля — обновляем форму
        if (currentTab === 'profile') {
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = val || '';
                    console.log(`✅ Поле ${id} установлено в: "${val || ''}"`);
                } else {
                    console.warn(`⚠️ Поле ${id} не найдено`);
                }
            };
            
            setVal('profileFirstname', firstName);
            setVal('profileLastname', lastname);  // Отчество
            setVal('profileSurname', surname);     // Фамилия
            setVal('profilePhone', phone);
            setVal('profileLocation', location);
            setVal('profileDescription', description);
            
            console.log('✅ Форма профиля обновлена');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
        const credentials = API.storage.getCredentials();
        document.getElementById('userName').textContent = credentials?.email || 'Пользователь';
        document.getElementById('userRole').textContent = 'Пользователь';
    }
}

// ==================== МЕНЮ ====================

const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Главная' },
    { id: 'profile', icon: 'fa-user', label: 'Профиль' },
    { id: 'my-animals', icon: 'fa-paw', label: 'Мои животные' },
    { id: 'my-fundraisers', icon: 'fa-bullhorn', label: 'Мои сборы' },
    { id: 'my-donations', icon: 'fa-receipt', label: 'Мои донаты' },
    { id: 'search', icon: 'fa-magnifying-glass', label: 'Найти питомца' },
    { id: 'all-fundraisers', icon: 'fa-hand-holding-dollar', label: 'Найти сбор' }
];

let currentTab = 'dashboard';

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    renderMenu();
    await loadUserProfile();
    switchTab('dashboard');
    
    // Проверяем параметр URL для автооткрытия модалки
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'add-animal') {
        // Небольшая задержка чтобы интерфейс успел отрисоваться
        setTimeout(() => {
            showAddAnimalModal();
            // Убираем параметр из URL чтобы не открывалось повторно
            window.history.replaceState({}, document.title, 'dashboard.html');
        }, 500);
    }
});

function renderMenu() {
    const nav = document.getElementById('sidebarNav');
    const bottomNav = document.getElementById('bottomNav');
    
    if (nav) {
        nav.innerHTML = menuItems.map((item) => `
            <a href="#" class="nav-item ${item.id === currentTab ? 'active' : ''}" 
               onclick="switchTab('${item.id}', '${item.label}'); return false;">
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }
    
    if (bottomNav) {
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

function switchTab(tabId, title) {
    currentTab = tabId;
    document.getElementById('pageTitle').textContent = title;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${tabId}'`)) {
            item.classList.add('active');
        }
    });
    
    renderContent(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== РЕНДЕР КОНТЕНТА ====================

async function renderContent(tabId) {
    const content = document.getElementById('mainContent');
    const credentials = API.storage.getCredentials();
    const userId = credentials?.userId;
    
    if (!userId) {
        content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка: не удалось получить ID пользователя. Войдите заново.</p>';
        return;
    }
    
    // Показываем загрузку
    content.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    
    try {
        switch (tabId) {
            case 'dashboard':
                await renderDashboard(content, userId);
                break;
            case 'my-animals':
                await renderMyAnimals(content, userId);
                break;
            case 'applications':
                renderApplications(content);
                break;
            case 'favorites':
                renderFavorites(content);
                break;
            case 'all-fundraisers':
                await renderAllFundraisers(content);
                 break;
            case 'my-fundraisers':
                 await renderMyFundraisers(content, userId);
                 break;
            case 'my-donations':
                await renderMyDonations(content, userId);
                break;
            case 'search':
                await renderSearch(content);
                break;
            case 'profile':
                renderProfile(content);
                // После рендера формы загружаем данные
                await loadUserProfile(true);
                break;
            default:
                content.innerHTML = '<p>Вкладка не найдена</p>';
        }
    } catch (error) {
        console.error(`❌ Ошибка на вкладке ${tabId}:`, error);
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title" style="color: #dc2626;">Ошибка загрузки</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="switchTab('${tabId}')" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Повторить
                </button>
            </div>
        `;
    }
}

// ==================== ВКЛАДКА: ГЛАВНАЯ ====================

async function renderDashboard(content, userId) {
    console.log('🏠 Загрузка главной...');
    
    let animals = [];
let donations = [];

try {
    animals = await API.Animal.getUserAnimals(userId);
    console.log('🐾 Загружено животных:', animals.length);
} catch (err) {
    console.error('❌ Ошибка загрузки животных:', err);
}

try {
    if (API.FundraiserAPI && API.FundraiserAPI.getUserDonations) {
        donations = await API.FundraiserAPI.getUserDonations(userId);
        console.log('💰 Загружено донатов:', donations.length);
    } else {
        console.warn('⚠️ API.FundraiserAPI.getUserDonations не найден');
    }
} catch (err) {
    console.error('❌ Ошибка загрузки донатов:', err);
}
    
    const totalDonated = donations.reduce((sum, d) => sum + (d.Amount || 0), 0);
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="border-left-color: #3b82f6;">
                <h3>Мои объявления</h3>
                <div class="value">${animals.length}</div>
            </div>
            <div class="stat-card" style="border-left-color: #f97316;">
                <h3>Пожертвований</h3>
                <div class="value">${donations.length}</div>
            </div>
            <div class="stat-card" style="border-left-color: #10b981;">
                <h3>Помощь оказана</h3>
                <div class="value">${totalDonated} ₽</div>
            </div>
        </div>

        <div class="card">
            <h2 class="card-title">Быстрые действия</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <div class="quick-action-card" onclick="showAddAnimalModal()">
                    <i class="fa-solid fa-circle-plus" style="font-size: 2rem; color: var(--primary);"></i>
                    <h3>Разместить животное</h3>
                    <p>Отдать даром, продать или собрать средства</p>
                </div>
                <div class="quick-action-card" onclick="showAddFundraiserModal()">
                    <i class="fa-solid fa-hand-holding-dollar" style="font-size: 2rem; color: #10b981;"></i>
                    <h3>Создать сбор</h3>
                    <p>Открыть сбор средств на помощь животному</p>
                </div>
                <div class="quick-action-card" onclick="switchTab('search', 'Поиск')">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--secondary);"></i>
                    <h3>Найти питомца</h3>
                    <p>Ищите среди объявлений</p>
                </div>
            </div>
        </div>

        ${animals.length > 0 ? `
            <div class="card">
                <h2 class="card-title">Мои последние объявления</h2>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Тип</th>
                                <th>Цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${animals.slice(0, 5).map(animal => `
                                <tr>
                                    <td><strong>${animal.Name}</strong></td>
                                    <td>${animal.Type}</td>
                                    <td>${animal.Cost > 0 ? animal.Cost + ' ₽' : 'Бесплатно'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
    `;
}

// ==================== ВКЛАДКА: МОИ ЖИВОТНЫЕ ====================

async function renderMyAnimals(content, userId) {
    console.log('🐾 Загрузка моих животных...');
    const animals = await API.Animal.getUserAnimals(userId);
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <h2 class="card-title" style="margin: 0;">Мои животные</h2>
            <button class="btn btn-primary" onclick="showAddAnimalModal()">
                <i class="fa-solid fa-plus"></i> Разместить объявление
            </button>
        </div>

        <div class="card">
            ${animals.length > 0 ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Тип</th>
                                <th>Порода</th>
                                <th>Возраст</th>
                                <th>Цена</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${animals.map(animal => `
                                <tr>
                                    <td><strong>${animal.Name}</strong></td>
                                    <td>${animal.Type}</td>
                                    <td>${animal.Breed}</td>
                                    <td>${animal.OrientatedAge} лет</td>
                                    <td>${animal.Cost > 0 ? animal.Cost + ' ₽' : 'Бесплатно'}</td>
                                    <td>
                                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;" onclick="openAnimalDetailModal(${animal.id})">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;" onclick='showOwnerProfile(${JSON.stringify(animal)})'>
                                            <i class="fa-solid fa-phone"></i>
                                        </button>
                                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteAnimal(${animal.id})">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                    </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">У вас пока нет объявлений</p>'}
        </div>
    `;
}


// ==================== ВКЛАДКА: ПОЖЕРТВОВАНИЯ ====================

// ==================== ВКЛАДКА: МОИ СБОРЫ ====================

async function renderMyFundraisers(content, userId) {
    console.log('📢 Загрузка моих сборов...');
    
    try {
        if (!API || !API.FundraiserAPI) {
            throw new Error('API.FundraiserAPI не доступен');
        }
        
        const allFundraisers = await API.FundraiserAPI.getAll({ limit: 1000 });
        
        // Фильтруем только мои сборы
        const myFundraisers = allFundraisers.filter(f => f.CreatorUserID === userId);
        
        // Сортируем по дате (новые сверху)
        myFundraisers.sort((a, b) => {
            const dateA = new Date(a.CreatedAt || 0);
            const dateB = new Date(b.CreatedAt || 0);
            return dateB - dateA;
        });
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <h2 class="card-title" style="margin: 0;">Мои сборы средств</h2>
                <button class="btn btn-primary" onclick="showAddFundraiserModal()">
                    <i class="fa-solid fa-plus"></i> Создать сбор
                </button>
            </div>
            
            ${myFundraisers.length > 0 ? `
                <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                    ${myFundraisers.map(f => {
                        const collected = f.CollectedAmount || 0;
                        const goal = f.TargetAmount || 0;
                        const percent = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;
                        
                        return `
                            <div class="fundraiser-card">
                                <img src="${f.ImagePath || 'https://via.placeholder.com/500x300?text=Нет+фото'}" alt="${f.Title}" class="fundraiser-image">
                                <div class="fundraiser-info">
                                    <h3 class="fundraiser-title">${f.Title}</h3>
                                    <p class="fundraiser-desc">${f.Description}</p>
                                    
                                    <div class="fundraiser-progress">
                                        <div class="fundraiser-meta">
                                            <span style="font-weight: 600; color: var(--secondary);">${collected} ₽</span>
                                            <span style="color: var(--gray-600);">из ${goal} ₽</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${percent}%;"></div>
                                        </div>
                                        <div style="text-align: right; font-size: 0.875rem; font-weight: 600; color: var(--secondary);">
                                            ${percent}% собрано
                                        </div>
                                    </div>
                                    
                                    ${f.AnimalID ? `<a href="#" onclick="openAnimalDetailModal(${f.AnimalID}); return false;" class="fundraiser-animal-link">
                                        <i class="fa-solid fa-paw"></i> Привязанное животное
                                    </a>` : ''}
                                    
                                    <div style="margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-radius: 0.5rem; font-size: 0.875rem; color: #92400e;">
                                        <i class="fa-solid fa-info-circle"></i> Это ваш сбор. Пожертвования самому себе запрещены.
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="card">
                    <p style="text-align: center; padding: 2rem; color: var(--gray-600);">
                        <i class="fa-solid fa-bullhorn" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
                        У вас пока нет открытых сборов
                    </p>
                </div>
            `}
        `;
    } catch (error) {
        console.error('❌ Ошибка загрузки моих сборов:', error);
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title" style="color: #dc2626;">Ошибка загрузки</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="switchTab('my-fundraisers')" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Повторить
                </button>
            </div>
        `;
    }
}

// ==================== ВКЛАДКА: ВСЕ СБОРЫ ====================

async function renderAllFundraisers(content) {
    console.log('💰 Загрузка всех сборов...');
    
    try {
        if (!API || !API.FundraiserAPI) {
            throw new Error('API.FundraiserAPI не доступен');
        }
        
        const credentials = API.storage.getCredentials();
        const currentUserId = credentials?.userId;
        
        const fundraisers = await API.FundraiserAPI.getAll({ limit: 100 });
        console.log('📦 Получено сборов:', fundraisers.length);
        
        // Сортируем по дате (новые сверху)
        fundraisers.sort((a, b) => {
            const dateA = new Date(a.CreatedAt || 0);
            const dateB = new Date(b.CreatedAt || 0);
            return dateB - dateA;
        });
        
        // Фильтруем: убираем сборы текущего пользователя
        const othersFundraisers = fundraisers.filter(f => f.CreatorUserID !== currentUserId);
        
        content.innerHTML = `
            <h2 class="card-title" style="margin-bottom: 1.5rem;">Все активные сборы</h2>
            <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                ${othersFundraisers.length > 0 ? othersFundraisers.map(f => {
                    const collected = f.CollectedAmount || 0;
                    const goal = f.TargetAmount || 0;
                    const percent = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;
                    
                    return `
                        <div class="fundraiser-card">
                            <img src="${f.ImagePath || 'https://via.placeholder.com/500x300?text=Нет+фото'}" alt="${f.Title}" class="fundraiser-image">
                            <div class="fundraiser-info">
                                <h3 class="fundraiser-title">${f.Title}</h3>
                                <p class="fundraiser-desc">${f.Description}</p>
                                
                                <div class="fundraiser-progress">
                                    <div class="fundraiser-meta">
                                        <span style="font-weight: 600; color: var(--secondary);">${collected} ₽</span>
                                        <span style="color: var(--gray-600);">из ${goal} ₽</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${percent}%;"></div>
                                    </div>
                                    <div style="text-align: right; font-size: 0.875rem; font-weight: 600; color: var(--secondary);">
                                        ${percent}% собрано
                                    </div>
                                </div>
                                
                                ${f.AnimalID ? `<a href="#" onclick="openAnimalDetailModal(${f.AnimalID}); return false;" class="fundraiser-animal-link">
                                    <i class="fa-solid fa-paw"></i> Посмотреть животное
                                </a>` : ''}
                                
                                <div class="donate-input-group">
                                    <input type="number" id="donateAmount_${f.id}" placeholder="Сумма в ₽" min="1">
                                    <button class="btn btn-primary" onclick="makeDonation(${f.id})">
                                        <i class="fa-solid fa-heart"></i> Помочь
                                    </button>
                                </div>
                                <div class="quick-amounts">
                                    <button class="quick-amount-btn" onclick="setDonateAmount(${f.id}, 100)">100 ₽</button>
                                    <button class="quick-amount-btn" onclick="setDonateAmount(${f.id}, 300)">300 ₽</button>
                                    <button class="quick-amount-btn" onclick="setDonateAmount(${f.id}, 500)">500 ₽</button>
                                    <button class="quick-amount-btn" onclick="setDonateAmount(${f.id}, 1000)">1000 ₽</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Пока нет других сборов</p>'}
            </div>
        `;
    } catch (error) {
        console.error('❌ Ошибка загрузки сборов:', error);
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title" style="color: #dc2626;">Ошибка загрузки</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="switchTab('all-fundraisers')" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Повторить
                </button>
            </div>
        `;
    }
}

// ==================== ВКЛАДКА: МОИ ДОНАТЫ ====================

async function renderMyDonations(content, userId) {
    console.log('🧾 Загрузка моих донатов...');
    
    try {
        if (!API || !API.FundraiserAPI) {
            throw new Error('API.FundraiserAPI не доступен');
        }
        
        // Загружаем донаты и все сборы параллельно
        const [donations, allFundraisers] = await Promise.all([
            API.FundraiserAPI.getUserDonations(userId),
            API.FundraiserAPI.getAll({ limit: 1000 })
        ]);
        
        console.log(' Получено донатов:', donations.length);
        
        // Создаём маппинг id -> название сбора
        const fundraiserMap = {};
        allFundraisers.forEach(f => {
            fundraiserMap[f.id] = f.Title || `Сбор #${f.id}`;
        });
        
        const totalAmount = donations.reduce((sum, d) => sum + (d.Amount || 0), 0);
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: #f97316;">
                    <h3>Всего пожертвовано</h3>
                    <div class="value">${totalAmount} ₽</div>
                </div>
                <div class="stat-card" style="border-left-color: #10b981;">
                    <h3>Количество донатов</h3>
                    <div class="value">${donations.length}</div>
                </div>
            </div>

            <h2 class="card-title" style="margin-bottom: 1.5rem;">История моих пожертвований</h2>
            <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                ${donations.length > 0 ? donations.map(d => {
                    const fundraiserId = d.FundraiserID || d.id;
                    const fundraiserTitle = fundraiserMap[fundraiserId] || `Сбор #${fundraiserId || '?'}`;
                    
                    return `
                        <div class="fundraiser-card">
                            <div class="fundraiser-info">
                                <h3 class="fundraiser-title">${fundraiserTitle}</h3>
                                <div style="font-size: 2rem; font-weight: bold; color: var(--primary); margin: 1rem 0;">
                                    ${d.Amount} ₽
                                </div>
                                <div style="color: var(--gray-600); font-size: 0.875rem;">
                                    <i class="fa-regular fa-calendar"></i> 
                                    ${d.CreatedAt ? new Date(d.CreatedAt).toLocaleDateString('ru-RU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Дата неизвестна'}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Вы ещё не делали пожертвований</p>'}
            </div>
        `;
    } catch (error) {
        console.error('❌ Ошибка загрузки донатов:', error);
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title" style="color: #dc2626;">Ошибка загрузки</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="switchTab('my-donations')" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Повторить
                </button>
            </div>
        `;
    }
}

// ==================== ВКЛАДКА: МОИ ДОНАТЫ ====================

async function renderMyDonations(content, userId) {
    console.log(' Загрузка моих донатов...');
    
    try {
        // Проверяем, доступен ли API
        if (!API || !API.FundraiserAPI) {
            throw new Error('API.FundraiserAPI не доступен. Проверьте подключение api.js');
        }
        
        const donations = await API.FundraiserAPI.getUserDonations(userId);
        console.log('📦 Получено донатов:', donations.length);
        
        const totalAmount = donations.reduce((sum, d) => sum + (d.Amount || 0), 0);
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: #f97316;">
                    <h3>Всего пожертвовано</h3>
                    <div class="value">${totalAmount} ₽</div>
                </div>
                <div class="stat-card" style="border-left-color: #10b981;">
                    <h3>Количество донатов</h3>
                    <div class="value">${donations.length}</div>
                </div>
            </div>

            <h2 class="card-title" style="margin-bottom: 1.5rem;">История моих пожертвований</h2>
            <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                ${donations.length > 0 ? donations.map(d => `
                    <div class="fundraiser-card">
                        <div class="fundraiser-info">
                            <h3 class="fundraiser-title">Сбор #${d.FundraiserID || d.id || '?'}</h3>
                            <div style="font-size: 2rem; font-weight: bold; color: var(--primary); margin: 1rem 0;">
                                ${d.Amount} ₽
                            </div>
                            <div style="color: var(--gray-600); font-size: 0.875rem;">
                                <i class="fa-regular fa-calendar"></i> 
                                ${d.CreatedAt ? new Date(d.CreatedAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Дата неизвестна'}
                            </div>
                        </div>
                    </div>
                `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Вы ещё не делали пожертвований</p>'}
            </div>
        `;
    } catch (error) {
        console.error('❌ Ошибка загрузки донатов:', error);
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title" style="color: #dc2626;">Ошибка загрузки</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="switchTab('my-donations')" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Повторить
                </button>
            </div>
        `;
    }
}

// ==================== ВКЛАДКА: ПОИСК ====================

async function renderSearch(content) {
    console.log(' Загрузка поиска...');
    
    try {
        const response = await fetch('/api/animal?limit=20');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки');
        }
        
        const animals = await response.json();
        const animalsList = Array.isArray(animals) ? animals : [];
        
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Поиск животных</h2>
                <div class="search-box" style="margin-bottom: 2rem;">
                    <select id="searchType" class="form-control">
                        <option value="">Все виды</option>
                        <option value="Cat">Кошки</option>
                        <option value="Dog">Собаки</option>
                        <option value="Bird">Птицы</option>
                    </select>
                    <select id="searchBreed" class="form-control">
                        <option value="">Все породы</option>
                    </select>
                    <button onclick="searchAnimals()" class="btn btn-primary">
                        <i class="fa-solid fa-search"></i> Искать
                    </button>
                </div>

                <div id="searchResults" class="animals-grid">
                    ${animalsList.length > 0 ? animalsList.map(animal => `
                        <div class="animal-card">
                            <img src="${animal.ImagePath || 'https://via.placeholder.com/500x500?text=Нет+фото'}" alt="${animal.Name}" class="animal-image">
                            <div class="animal-info">
                                <div class="animal-header">
                                    <h3 class="animal-name">${animal.Name}</h3>
                                    <span class="animal-badge">${animal.Type}</span>
                                </div>
                                <p class="animal-meta">${animal.Breed}, ${animal.OrientatedAge} лет</p>
                                <p class="animal-desc">${animal.Description}</p>
                                <div class="animal-actions">
                                    <button class="btn-adopt" onclick="openAnimalDetailModal(${animal.id})">
                                        <i class="fa-solid fa-circle-info"></i> Подробнее
                                    </button>
                                    <button class="btn-donate" onclick='showOwnerProfile(${JSON.stringify(animal)})'>
                                        <i class="fa-solid fa-phone"></i> Связаться
                                    </button>
                                </div>
                                </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Животные не найдены</p>'}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
    }
}

// ==================== ВКЛАДКА: ПРОФИЛЬ ====================

function renderProfile(content) {
    const profile = API.storage.getUserData() || {};
    
    const firstName = getField(profile, 'FirstName', 'firstname');
    const surname = getField(profile, 'Surname', 'surname');
    const lastname = getField(profile, 'Lastname', 'lastname');
    const phone = getField(profile, 'Phone', 'phone');
    const location = getField(profile, 'Location', 'location');
    const description = getField(profile, 'Description', 'description');
    
    content.innerHTML = `
        <div class="card" style="max-width: 600px;">
            <h2 class="card-title">Мой профиль</h2>
            <form id="profileForm">
                <div class="form-group">
                    <label>Имя *</label>
                    <input type="text" id="profileFirstname" value="${firstName}" required>
                </div>
                <div class="form-group">
                    <label>Отчество</label>
                    <input type="text" id="profileLastname" value="${lastname}">
                </div>
                <div class="form-group">
                    <label>Фамилия *</label>
                    <input type="text" id="profileSurname" value="${surname}" required>
                </div>
                <div class="form-group">
                    <label>Телефон *</label>
                    <input type="tel" id="profilePhone" value="${phone}" required>
                </div>
                <div class="form-group">
                    <label>Город</label>
                    <input type="text" id="profileLocation" value="${location}">
                </div>
                <div class="form-group">
                    <label>О себе</label>
                    <textarea id="profileDescription" rows="4">${description}</textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="fa-solid fa-save"></i> Сохранить изменения
                </button>
            </form>
            
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">
            
            <button class="btn btn-outline" style="width: 100%; color: #dc2626; border-color: #dc2626;" onclick="API.Auth.logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Выйти из аккаунта
            </button>
        </div>
    `;
    
    // Обработчик формы
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Сохранение...';
        
        try {
            const updateData = {
                firstname: document.getElementById('profileFirstname').value.trim(),
                lastname: document.getElementById('profileLastname').value.trim(),
                surname: document.getElementById('profileSurname').value.trim(),
                phone: document.getElementById('profilePhone').value.trim(),
                location: document.getElementById('profileLocation').value.trim(),
                description: document.getElementById('profileDescription').value.trim()
            };
            
            console.log('📤 Отправка данных профиля:', updateData);
            
            await API.User.updateProfile(updateData);
            console.log('✅ Профиль обновлён на сервере');
            
            // Принудительно перезагружаем профиль
            await loadUserProfile(true);
            
            alert('✓ Профиль успешно обновлён!');
            
        } catch (error) {
            console.error('❌ Ошибка обновления:', error);
            alert('Ошибка: ' + error.message);
        }
        
        btn.disabled = false;
        btn.innerHTML = originalText;
    });
}

// ==================== ФУНКЦИИ ПОЖЕРТВОВАНИЙ ====================

function setDonateAmount(fundraiserId, amount) {
    const input = document.getElementById(`donateAmount_${fundraiserId}`);
    if (input) input.value = amount;
}

async function makeDonation(fundraiserId) {
    if (!API.Auth.isAuthenticated()) {
        alert('Войдите в аккаунт, чтобы сделать пожертвование');
        window.location.href = 'login.html';
        return;
    }
    
    const input = document.getElementById(`donateAmount_${fundraiserId}`);
    const amount = parseInt(input?.value);
    
    if (!amount || amount < 1) {
        alert('Введите корректную сумму');
        return;
    }
    
    try {
        const credentials = API.storage.getCredentials();
        const currentUserId = credentials?.userId;
        
        // Получаем все сборы и проверяем владельца
        const allFundraisers = await API.FundraiserAPI.getAll({ limit: 1000 });
        const fundraiser = allFundraisers.find(f => f.id === fundraiserId);
        
        if (fundraiser && fundraiser.CreatorUserID === currentUserId) {
            alert(' Вы не можете пожертвовать самому себе!');
            return;
        }
        
        if (!confirm(`Вы хотите пожертвовать ${amount} ₽?`)) return;
        
        await API.FundraiserAPI.donate(fundraiserId, amount);
        alert(`Спасибо! Вы пожертвовали ${amount} ₽`);
        input.value = '';
        switchTab('all-fundraisers', 'Все сборы');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// ==================== ПОИСК ЖИВОТНЫХ ====================

async function searchAnimals() {
    const type = document.getElementById('searchType').value;
    const breed = document.getElementById('searchBreed').value;
    
    const params = {};
    if (type) params.type = type;
    if (breed) params.breed = breed;
    
    const results = document.getElementById('searchResults');
    results.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Поиск...</p>';
    
    try {
        const animals = await API.Animal.search(params);
        
        results.innerHTML = animals.length > 0 ? animals.map(animal => `
            <div class="animal-card">
                <img src="${animal.ImagePath || 'https://via.placeholder.com/500x500?text=Нет+фото'}" alt="${animal.Name}" class="animal-image">
                <div class="animal-info">
                    <div class="animal-header">
                        <h3 class="animal-name">${animal.Name}</h3>
                        <span class="animal-badge">${animal.Type}</span>
                    </div>
                    <p class="animal-meta">${animal.Breed}, ${animal.OrientatedAge} лет</p>
                    <p class="animal-desc">${animal.Description}</p>
                    <div class="animal-actions">
                        <button class="btn-adopt" onclick="openAnimalDetailModal(${animal.id})">
                            <i class="fa-solid fa-circle-info"></i> Подробнее
                        </button>
                        <button class="btn-donate" onclick="toggleFavoriteBtn(this, ${animal.id})">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Ничего не найдено</p>';
    } catch (error) {
        results.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка поиска</p>';
    }
}

// ==================== УДАЛЕНИЕ ЖИВОТНОГО ====================

async function deleteAnimal(animalId) {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    
    try {
        await API.Animal.delete(animalId);
        alert('Объявление удалено');
        switchTab('my-animals', 'Мои животные');
    } catch (error) {
        alert('Ошибка удаления: ' + error.message);
    }
}

function toggleFavoriteBtn(btn, animalId) {
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

function showQuickAction() {
    if (window.innerWidth <= 768) {
        const choice = prompt('Выберите действие:\n1. Разместить животное\n2. Создать сбор\n3. Найти питомца\n\nВведите номер:');
        if (choice === '1') showAddAnimalModal();
        else if (choice === '2') showAddFundraiserModal();
        else if (choice === '3') switchTab('search', 'Поиск');
    } else {
        showAddAnimalModal();
    }
}

// ==================== МОДАЛКА ДОБАВЛЕНИЯ ЖИВОТНОГО ====================

function showAddAnimalModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addAnimalModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="closeAddAnimalModal()">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div style="padding: 2rem;">
                <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">Разместить животное</h2>
                <form id="addAnimalForm">
                    <div class="form-group">
                        <label>Имя *</label>
                        <input type="text" id="animalName" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Тип *</label>
                            <select id="animalType" required>
                                <option value="Cat">Кошка</option>
                                <option value="Dog">Собака</option>
                                <option value="Bird">Птица</option>
                                <option value="Other">Другое</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Порода *</label>
                            <input type="text" id="animalBreed" required>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Возраст (лет) *</label>
                            <input type="number" id="animalAge" required min="0">
                        </div>
                        <div class="form-group">
                            <label>Цена (0 = бесплатно)</label>
                            <input type="number" id="animalCost" value="0" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="animalSterilized" style="width: auto;"> Стерилизовано
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Описание *</label>
                        <textarea id="animalDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Фото *</label>
                        <input type="file" id="animalImage" accept="image/*" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem;">
                        <i class="fa-solid fa-plus"></i> Разместить
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAddAnimalModal();
    });
    
    document.getElementById('addAnimalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Размещение...';
        
        const animalData = {
            name: document.getElementById('animalName').value,
            type: document.getElementById('animalType').value,
            breed: document.getElementById('animalBreed').value,
            age: parseInt(document.getElementById('animalAge').value),
            cost: parseInt(document.getElementById('animalCost').value),
            sterealized: document.getElementById('animalSterilized').checked,
            description: document.getElementById('animalDescription').value
        };
        
        const imageFile = document.getElementById('animalImage').files[0];
        
        try {
            await API.Animal.create(animalData, imageFile);
            alert('Животное успешно добавлено!');
            closeAddAnimalModal();
            switchTab('my-animals', 'Мои животные');
        } catch (error) {
            alert('Ошибка: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Разместить';
        }
    });
}

function closeAddAnimalModal() {
    const modal = document.getElementById('addAnimalModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// ==================== МОДАЛКА ДОБАВЛЕНИЯ СБОРА ====================

function showAddFundraiserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'addFundraiserModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="closeAddFundraiserModal()">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div style="padding: 2rem;">
                <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">Создать сбор средств</h2>
                <form id="addFundraiserForm">
                    <div class="form-group">
                        <label>Название сбора *</label>
                        <input type="text" id="fundraiserTitle" placeholder="Например: Операция для кота Муся" required>
                    </div>
                    <div class="form-group">
                        <label>Целевая сумма (₽) *</label>
                        <input type="number" id="fundraiserTarget" required min="100">
                    </div>
                    <div class="form-group">
                        <label>ID животного (если есть)</label>
                        <input type="number" id="fundraiserAnimalId" min="1">
                    </div>
                    <div class="form-group">
                        <label>Описание *</label>
                        <textarea id="fundraiserDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Фото обложки *</label>
                        <input type="file" id="fundraiserImage" accept="image/*" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem;">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Создать сбор
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAddFundraiserModal();
    });
    
    document.getElementById('addFundraiserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Создание...';
        
        const fundraiserData = {
            title: document.getElementById('fundraiserTitle').value,
            targetAmount: parseInt(document.getElementById('fundraiserTarget').value),
            description: document.getElementById('fundraiserDescription').value,
            animalId: document.getElementById('fundraiserAnimalId').value 
                ? parseInt(document.getElementById('fundraiserAnimalId').value) 
                : null
        };
        
        const imageFile = document.getElementById('fundraiserImage').files[0];
        
        try {
            await API.FundraiserAPI.create(fundraiserData, imageFile);
            alert('Сбор успешно создан!');
            closeAddFundraiserModal();
            switchTab('dashboard', 'Главная');
        } catch (error) {
            alert('Ошибка: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-hand-holding-dollar"></i> Создать сбор';
        }
    });
}

function closeAddFundraiserModal() {
    const modal = document.getElementById('addFundraiserModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// ==================== ДЕТАЛЬНАЯ КАРТОЧКА ЖИВОТНОГО ====================

async function openAnimalDetailModal(animalId) {
    const modal = document.getElementById('animalDetailModal');
    const modalContent = document.getElementById('animalDetailModalContent');
    
    modalContent.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const animal = await API.Animal.getById(animalId);
        
        const purposeHtml = animal.Cost > 0 
            ? `<span class="purpose-badge purpose-sale" style="font-size: 1rem; padding: 0.5rem 1rem;">${animal.Cost} ₽</span>`
            : '<span class="purpose-badge purpose-free" style="font-size: 1rem; padding: 0.5rem 1rem;">Отдам даром</span>';
        
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeAnimalDetailModal()">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="animal-detail">
                <div class="animal-detail-image">
                    <img src="${animal.ImagePath || 'https://via.placeholder.com/500x500?text=Нет+фото'}" alt="${animal.Name}">
                    <div class="animal-detail-purpose">${purposeHtml}</div>
                </div>
                <div class="animal-detail-info">
                    <div class="animal-detail-header">
                        <h2 class="animal-detail-name">${animal.Name}</h2>
                        <div class="animal-detail-meta">
                            <div class="animal-detail-meta-item">
                                <i class="fa-solid fa-paw"></i>
                                <span>${animal.Type}</span>
                            </div>
                            <div class="animal-detail-meta-item">
                                <i class="fa-solid fa-certificate"></i>
                                <span>${animal.Breed}</span>
                            </div>
                            <div class="animal-detail-meta-item">
                                <i class="fa-solid fa-cake-candles"></i>
                                <span>${animal.OrientatedAge} лет</span>
                            </div>
                        </div>
                    </div>

                    <div class="animal-detail-section">
                        <h3><i class="fa-solid fa-circle-info"></i> О животном</h3>
                        <p class="animal-detail-description">${animal.Description}</p>
                    </div>

                    <div class="animal-detail-section">
                        <h3><i class="fa-solid fa-heart-pulse"></i> Здоровье</h3>
                        <div class="animal-detail-features">
                            <div class="feature-item">
                                <i class="fa-solid fa-scissors"></i>
                                <div>
                                    <div class="feature-label">Стерилизация</div>
                                    <div class="feature-value">${animal.Sterealized ? 'Да' : 'Нет'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="animal-detail-actions">
                    <button class="btn-detail-secondary" onclick='showOwnerProfile(${JSON.stringify(animal)}); closeAnimalDetailModal();'>
                        <i class="fa-solid fa-phone"></i> Связаться
                    </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        modalContent.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки: ' + error.message + '</p>';
    }
}

function closeAnimalDetailModal() {
    const modal = document.getElementById('animalDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleAdoptRequest(animalName) {
    if (!API.Auth.isAuthenticated()) {
        alert('Войдите в аккаунт, чтобы оставить заявку');
        window.location.href = 'login.html';
        return;
    }
    alert(`Заявка на "${animalName}" отправлена!`);
    closeAnimalDetailModal();
}

function handleContact(animalName) {
    if (!API.Auth.isAuthenticated()) {
        alert('Войдите в аккаунт, чтобы связаться с владельцем');
        window.location.href = 'login.html';
        return;
    }
    alert(`Открываем чат с владельцем "${animalName}"`);
}

function toggleDetailFavorite(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    }
}

function shareAnimal(animalId) {
    if (navigator.share) {
        navigator.share({
            title: 'Посмотри это животное!',
            text: 'Нашёл интересное объявление',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована!');
    }
}

// Функция для отладки — показывает все поля профиля
window.debugProfile = async function() {
    const credentials = API.storage.getCredentials();
    if (!credentials) {
        console.error('Нет credentials');
        return;
    }
    
    try {
        const profile = await API.User.getProfile(credentials.userId);
        console.log('=== ВСЕ ПОЛЯ ПРОФИЛЯ ===');
        console.log(profile);
        console.log('=== КЛЮЧИ ===');
        console.log(Object.keys(profile));
        console.log('=== ЗНАЧЕНИЯ ===');
        Object.keys(profile).forEach(key => {
            console.log(`${key}:`, profile[key]);
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
};

// ==================== ПРОСМОТР ПРОФИЛЯ ВЛАДЕЛЬЦА ====================

async function showOwnerProfile(animal) {
    const ownerId = animal.OwnerID;
    
    if (!ownerId) {
        alert('Информация о владельце недоступна');
        return;
    }
    
    try {
        const response = await fetch(`/api/user/${ownerId}`);
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные владельца');
        }
        
        const owner = await response.json();
        
        const firstName = owner.FirstName || owner.firstname || '';
        const surname = owner.Surname || owner.surname || '';
        const lastname = owner.Lastname || owner.lastname || '';
        const phone = owner.Phone || owner.phone || '';
        const location = owner.Location || owner.location || '';
        const description = owner.Description || owner.description || '';
        
        const fullName = `${firstName} ${lastname} ${surname}`.trim() || 'Владелец';
        const initials = (firstName[0] || '') + (surname[0] || '');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'ownerProfileModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <button class="modal-close" onclick="closeOwnerProfileModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div style="padding: 2rem; text-align: center;">
                    <div style="width: 90px; height: 90px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-size: 2rem; font-weight: bold;">
                        ${initials || 'П'}
                    </div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">${fullName}</h2>
                    ${location ? `<p style="color: var(--gray-600); margin-bottom: 1.5rem;"><i class="fa-solid fa-location-dot"></i> ${location}</p>` : '<div style="margin-bottom: 1.5rem;"></div>'}
                    
                    <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 0.75rem; text-align: left;">
                        <h3 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Контактная информация</h3>
                        
                        ${phone ? `
                            <a href="tel:${phone}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 0.5rem; margin-bottom: 0.5rem; text-decoration: none; color: var(--gray-800); transition: all 0.3s;">
                                <i class="fa-solid fa-phone" style="color: var(--primary); font-size: 1.1rem;"></i>
                                <span style="font-weight: 600;">${phone}</span>
                            </a>
                        ` : '<p style="color: var(--gray-500); font-size: 0.875rem; padding: 0.5rem;">Телефон не указан</p>'}
                        
                        ${owner.Email ? `
                            <a href="mailto:${owner.Email}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 0.5rem; text-decoration: none; color: var(--gray-800); transition: all 0.3s;">
                                <i class="fa-solid fa-envelope" style="color: var(--secondary); font-size: 1.1rem;"></i>
                                <span style="font-weight: 600; font-size: 0.9rem;">${owner.Email}</span>
                            </a>
                        ` : ''}
                    </div>
                    
                    ${description ? `
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 0.75rem; text-align: left;">
                            <h3 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">О себе</h3>
                            <p style="color: var(--gray-700); font-size: 0.9rem; line-height: 1.5; margin: 0;">${description}</p>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 1.5rem; padding: 0.75rem; background: #dbeafe; border-radius: 0.5rem; font-size: 0.875rem; color: #1e40af;">
                        <i class="fa-solid fa-paw"></i> Владелец животного "<strong>${animal.Name}</strong>"
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeOwnerProfileModal();
        });
        
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        alert('Не удалось получить контактные данные владельца');
    }
}

function closeOwnerProfileModal() {
    const modal = document.getElementById('ownerProfileModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showOwnerProfileModal(profile, animals, fundraisers, animalName = '') {
    const firstName = profile.FirstName || profile.firstname || '';
    const surname = profile.Surname || profile.surname || '';
    const lastname = profile.Lastname || profile.lastname || '';
    const phone = profile.Phone || profile.phone || '';
    const location = profile.Location || profile.location || '';
    const description = profile.Description || profile.description || '';
    const email = profile.Email || profile.email || '';
    
    const fullName = `${firstName} ${lastname} ${surname}`.trim();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'ownerProfileModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <button class="modal-close" onclick="closeOwnerProfileModal()">
                <i class="fa-solid fa-xmark"></i>
            </button>
            
            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-size: 2.5rem; font-weight: bold;">
                        ${firstName[0] || 'П'}${surname[0] || ''}
                    </div>
                    <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${fullName}</h2>
                    ${location ? `<p style="color: var(--gray-600);"><i class="fa-solid fa-location-dot"></i> ${location}</p>` : ''}
                </div>
                
                ${animalName ? `<div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; color: #92400e;">
                    <i class="fa-solid fa-info-circle"></i> Вы просматриваете профиль владельца животного "<strong>${animalName}</strong>"
                </div>` : ''}
                
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--gray-800);"><i class="fa-solid fa-address-card"></i> Контактная информация</h3>
                    ${phone ? `<p style="margin-bottom: 0.5rem;"><i class="fa-solid fa-phone" style="color: var(--primary); margin-right: 0.5rem;"></i> ${phone}</p>` : ''}
                    ${email ? `<p style="margin-bottom: 0.5rem;"><i class="fa-solid fa-envelope" style="color: var(--primary); margin-right: 0.5rem;"></i> ${email}</p>` : ''}
                    ${description ? `<p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); color: var(--gray-600);">${description}</p>` : ''}
                </div>
                
                ${animals.length > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem; color: var(--gray-800);"><i class="fa-solid fa-paw"></i> Животные пользователя (${animals.length})</h3>
                        <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));">
                            ${animals.map(animal => `
                                <div class="animal-card">
                                    <img src="${animal.ImagePath || 'https://via.placeholder.com/300x200?text=Нет+фото'}" alt="${animal.Name}" class="animal-image" style="height: 180px;">
                                    <div class="animal-info" style="padding: 1rem;">
                                        <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${animal.Name}</h4>
                                        <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.5rem;">${animal.Type}, ${animal.Breed}</p>
                                        <p style="color: var(--gray-600); font-size: 0.875rem;">${animal.OrientatedAge} лет</p>
                                        <p style="margin-top: 0.5rem; font-weight: 600; color: ${animal.Cost > 0 ? 'var(--primary)' : 'var(--secondary)'};">
                                            ${animal.Cost > 0 ? animal.Cost + ' ₽' : 'Отдам даром'}
                                        </p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${fundraisers.length > 0 ? `
                    <div>
                        <h3 style="margin-bottom: 1rem; color: var(--gray-800);"><i class="fa-solid fa-hand-holding-dollar"></i> Сбор средств (${fundraisers.length})</h3>
                        <div class="animals-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                            ${fundraisers.map(f => {
                                const collected = f.CollectedAmount || 0;
                                const goal = f.TargetAmount || 0;
                                const percent = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;
                                
                                return `
                                    <div class="fundraiser-card">
                                        <img src="${f.ImagePath || 'https://via.placeholder.com/300x200?text=Нет+фото'}" alt="${f.Title}" class="fundraiser-image" style="height: 150px;">
                                        <div class="fundraiser-info" style="padding: 1rem;">
                                            <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${f.Title}</h4>
                                            <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.75rem;">${f.Description}</p>
                                            <div class="progress-bar" style="margin-bottom: 0.5rem;">
                                                <div class="progress-fill" style="width: ${percent}%;"></div>
                                            </div>
                                            <p style="font-size: 0.875rem; color: var(--secondary); font-weight: 600;">
                                                ${collected} ₽ из ${goal} ₽ (${percent}%)
                                            </p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${animals.length === 0 && fundraisers.length === 0 ? `
                    <p style="text-align: center; color: var(--gray-600); padding: 2rem;">
                        У пользователя пока нет объявлений и сборов
                    </p>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeOwnerProfileModal();
    });
}

function closeOwnerProfileModal() {
    const modal = document.getElementById('ownerProfileModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

