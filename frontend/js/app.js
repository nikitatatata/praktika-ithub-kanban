// Данные животных для главной страницы
const animalsData = [
    {
        id: 1,
        name: "Барни",
        type: "dog",
        typeName: "Собака",
        breed: "Метис",
        age: "2 года",
        purpose: "free",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80",
        description: "Очень дружелюбный и активный, любит играть с мячом. Хорошо ладит с детьми.",
        location: "Москва"
    },
    {
        id: 2,
        name: "Муся",
        type: "cat",
        typeName: "Кошка",
        breed: "Сибирская",
        age: "1 год",
        purpose: "free",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80",
        description: "Спокойная, ласковая, приучена к лотку. Стерилизована.",
        location: "Санкт-Петербург"
    },
    {
        id: 3,
        name: "Кеша",
        type: "bird",
        typeName: "Птица",
        breed: "Попугай",
        age: "1 год",
        purpose: "sale",
        price: 3000,
        image: "https://avatars.mds.yandex.net/i?id=455ca23d71e591038b325b0ccfd0f6d9_l-4289847-images-thumbs&n=13",
        description: "Говорящий попугай, очень умный и общительный.",
        location: "Казань"
    },
    {
        id: 4,
        name: "Рекс",
        type: "dog",
        typeName: "Собака",
        breed: "Овчарка",
        age: "4 года",
        purpose: "fundraising",
        collected: 15000,
        goal: 50000,
        image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=500&q=80",
        description: "Нужна операция на лапу. Преданный охранник, нуждается в помощи.",
        location: "Екатеринбург"
    }
];

// Отображение животных
function renderAnimals(animals) {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    grid.innerHTML = animals.map(animal => {
        let purposeHtml = '';
        if (animal.purpose === 'free') {
            purposeHtml = '<span class="purpose-badge purpose-free">Отдам даром</span>';
        } else if (animal.purpose === 'sale') {
            purposeHtml = `<span class="purpose-badge purpose-sale">${animal.price} ₽</span>`;
        } else if (animal.purpose === 'fundraising') {
            const percent = Math.round((animal.collected / animal.goal) * 100);
            purposeHtml = `
                <div style="margin-top: 0.5rem;">
                    <span class="purpose-badge purpose-fundraising">Сбор: ${percent}%</span>
                    <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 0.5rem;">
                        <div style="background: #f97316; height: 100%; width: ${percent}%; border-radius: 3px;"></div>
                    </div>
                    <small style="color: #6b7280;">${animal.collected} из ${animal.goal} ₽</small>
                </div>
            `;
        }
        
        return `
            <div class="animal-card">
                <img src="${animal.image}" alt="${animal.name}" class="animal-image">
                <div class="animal-info">
                    <div class="animal-header">
                        <h3 class="animal-name">${animal.name}</h3>
                        <span class="animal-badge">${animal.typeName}</span>
                    </div>
                    <p class="animal-meta">${animal.breed}, ${animal.age}</p>
                    <p class="animal-location"><i class="fa-solid fa-location-dot"></i> ${animal.location}</p>
                    ${purposeHtml}
                    <p class="animal-desc">${animal.description}</p>
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
    
    let filtered = animalsData;
    
    if (type) {
        filtered = filtered.filter(a => a.type === type);
    }
    if (purpose) {
        filtered = filtered.filter(a => a.purpose === purpose);
    }
    
    renderAnimals(filtered);
    
    // Прокрутка к результатам
    document.getElementById('animals').scrollIntoView({ behavior: 'smooth' });
    
    if (filtered.length === 0) {
        alert('По вашим критериям животных не найдено. Попробуйте изменить фильтры.');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderAnimals(animalsData);
});

// Открытие детальной карточки животного
function openAnimalModal(animalId) {
    const animal = animalsData.find(a => a.id === animalId);
    if (!animal) return;
    
    const modal = document.getElementById('animalModal');
    const modalContent = document.getElementById('animalModalContent');
    
    // Генерация HTML для модального окна
    let purposeHtml = '';
    if (animal.purpose === 'free') {
        purposeHtml = '<span class="purpose-badge purpose-free" style="font-size: 1rem; padding: 0.5rem 1rem;">Отдам даром</span>';
    } else if (animal.purpose === 'sale') {
        purposeHtml = `<span class="purpose-badge purpose-sale" style="font-size: 1rem; padding: 0.5rem 1rem;">${animal.price} ₽</span>`;
    } else if (animal.purpose === 'fundraising') {
        const percent = Math.round((animal.collected / animal.goal) * 100);
        purposeHtml = `
            <div class="fundraising-progress">
                <div class="fundraising-header">
                    <span class="fundraising-amount">Собрано: ${animal.collected} ₽</span>
                    <span class="fundraising-goal">Цель: ${animal.goal} ₽</span>
                </div>
                <div class="fundraising-bar">
                    <div class="fundraising-fill" style="width: ${percent}%"></div>
                </div>
                <div class="fundraising-percent">${percent}% собрано</div>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeAnimalModal()">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="animal-detail">
            <div class="animal-detail-image">
                <img src="${animal.image}" alt="${animal.name}">
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
                            <span>${animal.typeName}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-certificate"></i>
                            <span>${animal.breed}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-cake-candles"></i>
                            <span>${animal.age}</span>
                        </div>
                        <div class="animal-detail-meta-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${animal.location}</span>
                        </div>
                    </div>
                </div>

                <div class="animal-detail-section">
                    <h3><i class="fa-solid fa-circle-info"></i> О животном</h3>
                    <p class="animal-detail-description">${animal.description}</p>
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
                        <div class="owner-avatar">А</div>
                        <div class="owner-details">
                            <h4>Анна Смирнова</h4>
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
                    <button class="btn-detail-primary" onclick="handleAdoptRequest('${animal.name}')">
                        <i class="fa-solid fa-hand-holding-heart"></i>
                        ${animal.purpose === 'fundraising' ? 'Помочь' : 'Забрать'}
                    </button>
                    <button class="btn-detail-secondary" onclick="handleContact('${animal.name}')">
                        <i class="fa-solid fa-phone"></i>
                        Связаться
                    </button>
                    <button class="btn-detail-icon" onclick="toggleFavorite(this, ${animal.id})">
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

// Закрытие модального окна
function closeAnimalModal() {
    const modal = document.getElementById('animalModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие по клику на оверлей
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('animalModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAnimalModal();
            }
        });
    }
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAnimalModal();
    }
});

// Обработка заявки на усыновление
function handleAdoptRequest(animalName) {
    alert(`Заявка на "${animalName}"\n\nВ реальной версии откроется форма заявки.`);
    closeAnimalModal();
}

// Связаться с владельцем
function handleContact(animalName) {
    alert(`Связаться с владельцем "${animalName}"\n\nВ реальной версии откроется чат или покажутся контакты.`);
}

// Добавить в избранное
function toggleFavorite(btn, animalId) {
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

// Поделиться
function shareAnimal(animalId) {
    if (navigator.share) {
        navigator.share({
            title: 'Посмотри это животное!',
            text: 'Нашёл интересное объявление на Лапы, крылья и хвосты',
            url: window.location.href
        });
    } else {
        // Копирование ссылки
        navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована в буфер обмена!');
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