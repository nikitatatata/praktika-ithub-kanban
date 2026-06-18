// ==================== ГЛАВНАЯ СТРАНИЦА (без авторизации) ====================

let currentAnimals = [];
let currentSort = 'newest';

// Загрузка животных с API (доступна всем)
async function loadAnimals(params = {}) {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    
    try {
        // Публичный endpoint - не требует авторизации
        const queryParams = new URLSearchParams();
        
        if (params.type) queryParams.append('Type', params.type);
        if (params.breed) queryParams.append('Breed', params.breed);
        if (params.age) queryParams.append('Age', params.age);
        if (params.sterealized !== undefined) {
            queryParams.append('Sterealized', params.sterealized);
        }
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset !== undefined) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/animal?${queryString}` : '/api/animal';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animals = await response.json();
        currentAnimals = Array.isArray(animals) ? animals : [];
        console.log(' Загружено животных:', currentAnimals.length);
        applySorting();
    } catch (error) {
        console.error('❌ Ошибка загрузки животных:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки животных</p>';
    }
}

// Применение сортировки
function applySorting() {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    let sorted = [...currentAnimals];
    
    switch (currentSort) {
        case 'newest':
            break;
        case 'oldest':
            sorted.reverse();
            break;
        case 'cheap':
            sorted.sort((a, b) => (a.Cost || 0) - (b.Cost || 0));
            break;
        case 'expensive':
            sorted.sort((a, b) => (b.Cost || 0) - (a.Cost || 0));
            break;
        case 'young':
            sorted.sort((a, b) => (a.OrientatedAge || 0) - (b.OrientatedAge || 0));
            break;
        case 'old':
            sorted.sort((a, b) => (b.OrientatedAge || 0) - (a.OrientatedAge || 0));
            break;
        case 'free':
            sorted = sorted.filter(a => !a.Cost || a.Cost === 0);
            break;
        case 'sterilized':
            sorted = sorted.filter(a => a.Sterealized);
            break;
    }
    
    renderAnimals(sorted);
}

// Обработчик сортировки
function handleSortChange(event) {
    currentSort = event.target.value;
    applySorting();
}

// Отображение животных
function renderAnimals(animals) {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    if (animals.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Животные не найдены</p>';
        return;
    }
    
    grid.innerHTML = animals.map(animal => {
        const priceHtml = animal.Cost > 0 
            ? `<span class="purpose-badge purpose-sale">${animal.Cost} ₽</span>`
            : '<span class="purpose-badge purpose-free">Отдам даром</span>';
        
        return `
            <div class="animal-card">
                <img src="${animal.ImagePath || 'https://via.placeholder.com/500x500?text=Нет+фото'}" alt="${animal.Name}" class="animal-image">
                <div class="animal-info">
                    <div class="animal-header">
                        <h3 class="animal-name">${animal.Name}</h3>
                        <span class="animal-badge">${animal.Type}</span>
                    </div>
                    <p class="animal-meta">${animal.Breed}, ${animal.OrientatedAge} лет</p>
                    ${priceHtml}
                    <p class="animal-desc">${animal.Description}</p>
                    <div class="animal-actions">
                        <button class="btn-adopt" onclick="openAnimalModal(${animal.id})">
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
        `;
    }).join('');
}

// Фильтрация животных
function filterAnimals() {
    const type = document.getElementById('animalType')?.value;
    const purpose = document.getElementById('animalPurpose')?.value;
    const age = document.getElementById('animalAge')?.value;
    
    const params = {};
    if (type) params.type = type;
    if (age) params.age = age;
    
    loadAnimals(params);
    
    const animalsSection = document.getElementById('animals');
    if (animalsSection) {
        animalsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Открытие детальной карточки
async function openAnimalModal(animalId) {
    const modal = document.getElementById('animalModal');
    const modalContent = document.getElementById('animalModalContent');
    
    if (!modal || !modalContent) {
        alert('Ошибка: модальное окно не найдено');
        return;
    }
    
    modalContent.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const response = await fetch(`/api/animal/${animalId}`);
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные');
        }
        
        const animal = await response.json();
        
        const purposeHtml = animal.Cost > 0 
            ? `<span class="purpose-badge purpose-sale" style="font-size: 1rem; padding: 0.5rem 1rem;">${animal.Cost} ₽</span>`
            : '<span class="purpose-badge purpose-free" style="font-size: 1rem; padding: 0.5rem 1rem;">Отдам даром</span>';
        
        modalContent.innerHTML = `
            <button class="modal-close" onclick="closeAnimalModal()">
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
                    <button class="btn-detail-secondary" onclick='showOwnerProfile(${JSON.stringify(animal)}); closeAnimalModal();'>
                        <i class="fa-solid fa-phone"></i> Связаться
                    </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        modalContent.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
    }
}

function closeAnimalModal() {
    const modal = document.getElementById('animalModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleAdoptRequest(animalName) {
    // Проверяем, авторизован ли пользователь
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
        if (confirm('Чтобы оставить заявку, нужно войти в аккаунт. Перейти на страницу входа?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    alert(`Заявка на "${animalName}" отправлена!`);
    closeAnimalModal();
}

function handleContact(animalName) {
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
        if (confirm('Чтобы связаться с владельцем, нужно войти в аккаунт. Перейти на страницу входа?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Здесь нужно получить ID владельца из текущей модалки
    // Это сложнее, нужно передать ID в handleContact
    alert(`Открываем профиль владельца "${animalName}"`);
    // В идеале здесь должен быть вызов openOwnerProfile(ownerId, animalName)
}

function toggleFavorite(btn) {
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

// Закрытие модалки по клику вне её
document.addEventListener('click', (e) => {
    const modal = document.getElementById('animalModal');
    if (modal && e.target === modal) {
        closeAnimalModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAnimalModal();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Главная страница загружена');
    loadAnimals();
});


// Проверка авторизации на главной странице
// Проверка авторизации на главной странице
function updateNavAuth() {
    const credentials = localStorage.getItem('userCredentials');
    const navActions = document.getElementById('navActions');
    const mobileNavActions = document.getElementById('mobileNavActions');
    
    if (credentials) {
        // Пользователь авторизован
        const userData = localStorage.getItem('userData');
        const profile = userData ? JSON.parse(userData) : null;
        const firstName = profile?.FirstName || profile?.firstname || '';
        const surname = profile?.Surname || profile?.surname || '';
        const displayName = `${firstName} ${surname}`.trim() || 'Личный кабинет';
        
        if (navActions) {
            navActions.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline">
                    <i class="fa-solid fa-user"></i> ${displayName}
                </a>
                <button onclick="logoutFromMain()" class="btn btn-outline" style="color: #dc2626; border-color: #dc2626;">
                    <i class="fa-solid fa-right-from-bracket"></i> Выйти
                </button>
            `;
        }
        
        if (mobileNavActions) {
            mobileNavActions.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline" onclick="closeMobileNav()">
                    <i class="fa-solid fa-user"></i> ${displayName}
                </a>
                <button onclick="logoutFromMain()" class="btn btn-outline" style="color: #dc2626; border-color: #dc2626; width: 100%;">
                    <i class="fa-solid fa-right-from-bracket"></i> Выйти
                </button>
            `;
        }
    } else {
        // Пользователь не авторизован
        if (navActions) {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-outline">Войти</a>
                <a href="register.html" class="btn btn-primary">Регистрация</a>
            `;
        }
        
        if (mobileNavActions) {
            mobileNavActions.innerHTML = `
                <a href="login.html" class="btn btn-outline" onclick="closeMobileNav()">Войти</a>
                <a href="register.html" class="btn btn-primary" onclick="closeMobileNav()">Регистрация</a>
            `;
        }
    }
}

function logoutFromMain() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        localStorage.removeItem('userCredentials');
        localStorage.removeItem('userData');
        updateNavAuth();
        alert('Вы вышли из аккаунта');
    }
}

// Обработчик кнопки "Разместить объявление"
function handlePostAdClick() {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
        // Не авторизован — предлагаем войти
        if (confirm('Чтобы разместить объявление, нужно войти в аккаунт. Перейти на страницу входа?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Авторизован — переходим в dashboard с параметром
    window.location.href = 'dashboard.html?action=add-animal';
}

function logoutFromMain() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        localStorage.removeItem('userCredentials');
        localStorage.removeItem('userData');
        updateNavAuth();
        alert('Вы вышли из аккаунта');
    }
}

// Вызываем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Главная страница загружена');
    updateNavAuth();
    loadAnimals();
});

// Загрузка активных сборов
async function loadFundraisers() {
    const grid = document.getElementById('fundraisersGrid');
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    
    try {
        const response = await fetch('/api/fundraisers?limit=20');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки');
        }
        
        const fundraisers = await response.json();
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        
        if (list.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Пока нет активных сборов</p>';
            return;
        }
        
        grid.innerHTML = list.map(f => {
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
                        
                        <div class="donate-input-group">
                            <input type="number" id="donateAmount_${f.id}" placeholder="Сумма в ₽" min="1">
                            <button class="btn btn-primary" onclick="makeDonationFromMain(${f.id})">
                                <i class="fa-solid fa-heart"></i> Помочь
                            </button>
                        </div>
                        <div class="quick-amounts">
                            <button class="quick-amount-btn" onclick="setDonateAmountMain(${f.id}, 100)">100 ₽</button>
                            <button class="quick-amount-btn" onclick="setDonateAmountMain(${f.id}, 300)">300 ₽</button>
                            <button class="quick-amount-btn" onclick="setDonateAmountMain(${f.id}, 500)">500 ₽</button>
                            <button class="quick-amount-btn" onclick="setDonateAmountMain(${f.id}, 1000)">1000 ₽</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки сборов:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки сборов</p>';
    }

    async function loadFundraisers() {
    const grid = document.getElementById('fundraisersGrid');
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Загрузка...</p>';
    
    try {
        const response = await fetch('/api/fundraisers?limit=20');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки');
        }
        
        const fundraisers = await response.json();
        const list = Array.isArray(fundraisers) ? fundraisers : [];
        
        // Получаем ID текущего пользователя
        const credentials = localStorage.getItem('userCredentials');
        const currentUserId = credentials ? JSON.parse(credentials).userId : null;
        
        // Фильтруем: убираем сборы текущего пользователя
        const othersFundraisers = currentUserId 
            ? list.filter(f => f.CreatorUserID !== currentUserId)
            : list;
        
        if (othersFundraisers.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">Пока нет доступных сборов</p>';
            return;
        }
        
        // ... остальной код рендера ...
        grid.innerHTML = othersFundraisers.map(f => {
            // ... тот же код что был ...
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки сборов:', error);
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки сборов</p>';
    }
}
}

function setDonateAmountMain(fundraiserId, amount) {
    const input = document.getElementById(`donateAmount_${fundraiserId}`);
    if (input) input.value = amount;
}

async function makeDonationFromMain(fundraiserId) {
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
        if (confirm('Чтобы сделать пожертвование, нужно войти в аккаунт. Перейти на страницу входа?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    const input = document.getElementById(`donateAmount_${fundraiserId}`);
    const amount = parseInt(input?.value);
    
    if (!amount || amount < 1) {
        alert('Введите корректную сумму');
        return;
    }
    
    if (!confirm(`Вы хотите пожертвовать ${amount} ₽?`)) return;
    
    try {
        const user = JSON.parse(credentials);
        const formData = new FormData();
        formData.append('Amount', amount);
        formData.append('Email', user.email);
        formData.append('PasswordHash', user.passwordHash);
        
        const response = await fetch(`/api/fundraiser/${fundraiserId}/donate`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Ошибка пожертвования');
        }
        
        alert(`Спасибо! Вы пожертвовали ${amount} ₽`);
        input.value = '';
        loadFundraisers(); // Обновляем список
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Загружаем сборы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Главная страница загружена');
    updateNavAuth();
    loadAnimals();
    loadFundraisers(); // ← Добавили загрузку сборов
});