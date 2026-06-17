// Загрузка животных с API
async function loadAnimals(params = {}) {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Загрузка...</p>';
    
    try {
        const animals = await API.Animal.search(params);
        renderAnimals(animals);
    } catch (error) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки животных</p>';
        console.error(error);
    }
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
                        <button class="btn-donate" onclick="event.stopPropagation(); toggleFavoriteBtn(this, ${animal.id})">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Фильтрация животных
function filterAnimals() {
    const type = document.getElementById('animalType').value;
    const purpose = document.getElementById('animalPurpose').value;
    const age = document.getElementById('animalAge').value;
    const gender = document.getElementById('animalGender').value;
    
    const params = {};
    if (type) params.type = type;
    if (age) params.age = age;
    
    loadAnimals(params);
    
    document.getElementById('animals').scrollIntoView({ behavior: 'smooth' });
}

// Открытие детальной карточки
async function openAnimalModal(animalId) {
    const modal = document.getElementById('animalModal');
    const modalContent = document.getElementById('animalModalContent');
    
    modalContent.innerHTML = '<p style="text-align: center; padding: 2rem;">Загрузка...</p>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const animal = await API.Animal.getById(animalId);
        
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

                    <div class="animal-detail-actions">
                        <button class="btn-detail-primary" onclick="handleAdoptRequest('${animal.Name}')">
                            <i class="fa-solid fa-hand-holding-heart"></i> Забрать
                        </button>
                        <button class="btn-detail-secondary" onclick="handleContact('${animal.Name}')">
                            <i class="fa-solid fa-phone"></i> Связаться
                        </button>
                        <button class="btn-detail-icon" onclick="toggleFavorite(this)">
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
        modalContent.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc2626;">Ошибка загрузки</p>';
    }
}

function closeAnimalModal() {
    const modal = document.getElementById('animalModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleAdoptRequest(animalName) {
    alert(`Заявка на "${animalName}" отправлена!`);
    closeAnimalModal();
}

function handleContact(animalName) {
    alert(`Открываем чат с владельцем "${animalName}"`);
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

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAnimalModal();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadAnimals();
});