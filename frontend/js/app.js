// Данные животных
const animalsData = [
    {
        id: 1,
        name: "Барни",
        type: "dog",
        typeName: "Собака",
        age: "2 года",
        breed: "Метис",
        gender: "male",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80",
        description: "Очень дружелюбный и активный, любит играть с мячом. Хорошо ладит с детьми."
    },
    {
        id: 2,
        name: "Муся",
        type: "cat",
        typeName: "Кошка",
        age: "1 год",
        breed: "Домашняя",
        gender: "female",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80",
        description: "Спокойная, ласковая, приучена к лотку. Любит сидеть на коленях."
    },
    {
        id: 3,
        name: "Рекс",
        type: "dog",
        typeName: "Собака",
        age: "4 года",
        breed: "Овчарка",
        gender: "male",
        image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=500&q=80",
        description: "Преданный охранник, нуждается в опытном хозяине. Прошёл курс дрессировки."
    }
];

// Отображение животных
function renderAnimals(animals) {
    const grid = document.getElementById('animalsGrid');
    if (!grid) return;
    
    grid.innerHTML = animals.map(animal => `
        <div class="animal-card">
            <img src="${animal.image}" alt="${animal.name}" class="animal-image">
            <div class="animal-info">
                <div class="animal-header">
                    <h3 class="animal-name">${animal.name}</h3>
                    <span class="animal-badge">${animal.typeName}</span>
                </div>
                <p class="animal-meta">${animal.breed}, ${animal.age}</p>
                <p class="animal-desc">${animal.description}</p>
                <div class="animal-actions">
                    <button class="btn-adopt" onclick="openAdoptModal('${animal.name}')">
                        <i class="fa-solid fa-heart"></i> Забрать
                    </button>
                    <button class="btn-donate" onclick="openDonateModal('${animal.name}')">
                        <i class="fa-solid fa-ruble-sign"></i> Помочь
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Фильтрация животных
function filterAnimals() {
    const type = document.getElementById('animalType').value;
    const age = document.getElementById('animalAge').value;
    const gender = document.getElementById('animalGender').value;
    
    let filtered = animalsData;
    
    if (type) {
        filtered = filtered.filter(a => a.type === type);
    }
    
    // Здесь можно добавить больше логики фильтрации
    
    renderAnimals(filtered);
    
    if (filtered.length === 0) {
        alert('По вашим критериям животных не найдено. Попробуйте изменить фильтры.');
    }
}

// Модальные окна (заглушки)
function openAdoptModal(animalName) {
    alert(`Заявка на усыновление "${animalName}"\n\nВ реальной версии здесь откроется форма заявки.`);
}

function openDonateModal(animalName) {
    alert(`Пожертвование для "${animalName}"\n\nВ реальной версии здесь откроется форма оплаты.`);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderAnimals(animalsData);
});