// Проверка авторизации
function checkAuth() {
    if (!API.Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Загрузка профиля пользователя
async function loadUserProfile() {
    const credentials = API.storage.getCredentials();
    if (!credentials || !credentials.userId) {
        console.warn('userId не найден в credentials');
        return;
    }
    
    try {
        // Сначала пробуем из кеша
        let profile = API.storage.getUserData();
        
        // Если в кеше нет или ID не совпадает - загружаем с сервера
        if (!profile || profile.id !== credentials.userId) {
            profile = await API.User.getProfile(credentials.userId);
            API.storage.setUserData(profile);
        }
        
        const fullName = `${profile.FirstName || ''} ${profile.Surname || ''}`.trim();
        document.getElementById('userName').textContent = fullName || 'Пользователь';
        document.getElementById('userRole').textContent = profile.Description || 'Пользователь';
        
        // Обновляем аватар (инициалы)
        const initials = (profile.FirstName?.[0] || '') + (profile.Surname?.[0] || '');
        document.getElementById('userAvatar').textContent = initials || 'П';
        
    } catch (error) {
        console.error('Error loading profile:', error);
        // Если не удалось загрузить - показываем email
        document.getElementById('userName').textContent = credentials.email;
        document.getElementById('userRole').textContent = 'Пользователь';
    }
}

const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Главная' },
    { id: 'my-animals', icon: 'fa-paw', label: 'Мои животные' },
    { id: 'applications', icon: 'fa-comments', label: 'Заявки' },
    { id: 'favorites', icon: 'fa-heart', label: 'Избранное' },
    { id: 'donations', icon: 'fa-hand-holding-dollar', label: 'Мои пожертвования' },
    { id: 'search', icon: 'fa-magnifying-glass', label: 'Поиск' },
    { id: 'profile', icon: 'fa-user', label: 'Профиль' }
];

let currentTab = 'dashboard';

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    await loadUserProfile();
    renderMenu();
    switchTab('dashboard');
});

// Рендер меню
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

// Смена вкладки
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

// Рендер контента
async function renderContent(tabId) {
    const content = document.getElementById('mainContent');
    const credentials = API.storage.getCredentials();
    const userId = credentials?.userId;
    
    if (tabId === 'dashboard') {
        content.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
        
        try {
            const [animals, donations] = await Promise.all([
                API.Animal.getUserAnimals(userId).catch(() => []),
                API.FundraiserAPI.getUserDonations(userId).catch(() => [])
            ]);
            
            const activeAnimals = animals.filter(a => a.Cost !== undefined);
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
        } catch (error) {
            content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки данных</p>';
        }
    }
    else if (tabId === 'my-animals') {
        content.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
        
        try {
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
                                                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteAnimal(${animal.id})">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">У вас пока нет объявлений</p>'}
                </div>
            `;
        } catch (error) {
            content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
        }
    }
    else if (tabId === 'applications') {
        content.innerHTML = `
            <div class="card">
                <h2 class="card-title">Заявки на моих животных</h2>
                <p style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fa-solid fa-comments" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
                    Раздел заявок находится в разработке
                </p>
            </div>
        `;
    }
    else if (tabId === 'favorites') {
        content.innerHTML = `
            <h2 class="card-title" style="margin-bottom: 1.5rem;">Избранные животные</h2>
            <div class="card">
                <p style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fa-regular fa-heart" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.3;"></i>
                    У вас пока нет избранных животных
                </p>
            </div>
        `;
    }
    else if (tabId === 'donations') {
        content.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
        
        try {
            const donations = await API.FundraiserAPI.getUserDonations(userId);
            const totalAmount = donations.reduce((sum, d) => sum + (d.Amount || 0), 0);
            
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card" style="border-left-color: #f97316;">
                        <h3>Всего пожертвовано</h3>
                        <div class="value">${totalAmount} ₽</div>
                    </div>
                    <div class="stat-card" style="border-left-color: #10b981;">
                        <h3>Помощи оказано</h3>
                        <div class="value">${donations.length}</div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">История пожертвований</h2>
                    ${donations.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Сбор</th>
                                        <th>Сумма</th>
                                        <th>Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${donations.map(d => `
                                        <tr>
                                            <td><strong>Сбор #${d.FundraiserID || d.id || '?'}</strong></td>
                                            <td><strong>${d.Amount} ₽</strong></td>
                                            <td>${d.CreatedAt ? new Date(d.CreatedAt).toLocaleDateString('ru-RU') : '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Вы ещё не делали пожертвований</p>'}
                </div>
            `;
        } catch (error) {
            content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
        }
    }
    else if (tabId === 'search') {
        content.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
        
        try {
            const animals = await API.Animal.search({ limit: 20 });
            
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
                        ${animals.length > 0 ? animals.map(animal => `
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
                        `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Животные не найдены</p>'}
                    </div>
                </div>
            `;
        } catch (error) {
            content.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
        }
    }
    else if (tabId === 'profile') {
        const profile = API.storage.getUserData();
        
        content.innerHTML = `
            <div class="card" style="max-width: 600px;">
                <h2 class="card-title">Мой профиль</h2>
                <form id="profileForm">
                    <div class="form-group">
                        <label>Имя</label>
                        <input type="text" id="profileFirstname" value="${profile?.FirstName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Фамилия</label>
                        <input type="text" id="profileSurname" value="${profile?.Surname || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <input type="tel" id="profilePhone" value="${profile?.Phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Город</label>
                        <input type="text" id="profileLocation" value="${profile?.Location || ''}">
                    </div>
                    <div class="form-group">
                        <label>О себе</label>
                        <textarea id="profileDescription" rows="4">${profile?.Description || ''}</textarea>
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
        
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Сохранение...';
            
            try {
                await API.User.updateProfile({
                    firstname: document.getElementById('profileFirstname').value,
                    surname: document.getElementById('profileSurname').value,
                    phone: document.getElementById('profilePhone').value,
                    location: document.getElementById('profileLocation').value,
                    description: document.getElementById('profileDescription').value
                });
                
                alert('Профиль успешно обновлён!');
                await loadUserProfile();
            } catch (error) {
                alert('Ошибка: ' + error.message);
            }
            
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Сохранить изменения';
        });
    }
}

// Поиск животных
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

// Удаление животного
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

// Избранное
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
                        <button class="btn-detail-primary" onclick="handleAdoptRequest('${animal.Name}')">
                            <i class="fa-solid fa-hand-holding-heart"></i> Забрать
                        </button>
                        <button class="btn-detail-secondary" onclick="handleContact('${animal.Name}')">
                            <i class="fa-solid fa-phone"></i> Связаться
                        </button>
                        <button class="btn-detail-icon" onclick="toggleDetailFavorite(this)">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <button class="btn-detail-icon" onclick="shareAnimal(${animal.id})">
                            <i class="fa-solid fa-share-nodes"></i>
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
    alert(`Заявка на "${animalName}" отправлена!`);
    closeAnimalDetailModal();
}

function handleContact(animalName) {
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