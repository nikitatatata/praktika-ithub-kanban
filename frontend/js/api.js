// js/api.js - Модуль для работы с API

// ==================== ХЕШИРОВАНИЕ ПАРОЛЯ ====================

async function hashPassword(password) {
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    console.warn('⚠️ Web Crypto API недоступен. Используйте https или localhost!');
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
}

// ==================== ХРАНИЛИЩЕ ====================

const storage = {
    getCredentials() {
        const data = localStorage.getItem('userCredentials');
        return data ? JSON.parse(data) : null;
    },
    
    setCredentials(email, passwordHash, userId) {
        localStorage.setItem('userCredentials', JSON.stringify({
            email,
            passwordHash,
            userId: userId || null
        }));
    },
    
    clearCredentials() {
        localStorage.removeItem('userCredentials');
        localStorage.removeItem('userData');
    },
    
    getUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    },
    
    setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }
};

// ==================== БАЗОВЫЙ ЗАПРОС ====================

async function apiRequest(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            ...options.headers
        }
    };
    
    // Для FormData не устанавливаем Content-Type — браузер сам добавит boundary
    if (!(options.body instanceof FormData)) {
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
    }
    
    try {
        const response = await fetch(endpoint, config);
        const status = response.status;
        
        // 204 No Content
        if (status === 204) {
            return { success: true, status, data: null };
        }
        
        // Парсим ответ
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text().catch(() => '');
            // Пытаемся распарсить как число (ID пользователя)
            const num = Number(text);
            if (!isNaN(num) && text.trim() !== '') {
                data = num;
            } else if (text === 'true') {
                data = true;
            } else if (text === 'false') {
                data = false;
            } else {
                data = text;
            }
        }
        
        // Возвращаем объект с успехом/ошибкой
        if (response.ok) {
            return { success: true, status, data };
        }
        
        return { success: false, status, data };
        
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// ==================== АУТЕНТИФИКАЦИЯ ====================

const AuthAPI = {
    async login(email, password) {
        const passwordHash = await hashPassword(password);
        
        const formData = new URLSearchParams();
        formData.append('Email', email);
        formData.append('PasswordHash', passwordHash);
        
        const response = await apiRequest('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        // Успешный вход - бэкенд возвращает userId (число)
        if (response.success && typeof response.data === 'number' && response.data > 0) {
            storage.setCredentials(email, passwordHash, response.data);
            return { success: true, userId: response.data };
        }
        
        // 403 - пользователь не найден или неверный пароль
        if (response.status === 403) {
            return {
                success: false,
                error: 'Пользователь с таким email не найден или неверный пароль'
            };
        }
        
        return {
            success: false,
            error: 'Ошибка входа. Попробуйте позже.'
        };
    },
    
    async register(userData) {
        const passwordHash = await hashPassword(userData.password);
        
        const formData = new URLSearchParams();
        formData.append('Email', userData.email);
        formData.append('PasswordHash', passwordHash);
        formData.append('Firstname', userData.firstname);
        formData.append('Surname', userData.surname);
        formData.append('Phone', userData.phone);
        
        if (userData.lastname) formData.append('Lastname', userData.lastname);
        if (userData.description) formData.append('Description', userData.description);
        if (userData.location) formData.append('Location', userData.location);
        
        const response = await apiRequest('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        // Успешная регистрация - бэкенд возвращает userId
        if (response.success && typeof response.data === 'number' && response.data > 0) {
            storage.setCredentials(userData.email, passwordHash, response.data);
            return { success: true, userId: response.data };
        }
        
        // 409 - пользователь уже существует
        if (response.status === 409) {
            return {
                success: false,
                error: 'Пользователь с таким email уже зарегистрирован'
            };
        }
        
        return {
            success: false,
            error: 'Ошибка регистрации. Попробуйте позже.'
        };
    },
    
    logout() {
        storage.clearCredentials();
        window.location.href = 'index.html';
    },
    
    isAuthenticated() {
        return storage.getCredentials() !== null;
    },
    
    getCredentials() {
        return storage.getCredentials();
    }
};

// ==================== ПОЛЬЗОВАТЕЛИ ====================

const UserAPI = {
    async getProfile(userId) {
        const response = await apiRequest(`/api/user/${userId}`);
        if (!response.success) {
            if (response.status === 404) {
                throw new Error('Пользователь не найден');
            }
            throw new Error('Ошибка загрузки профиля');
        }
        return response.data;
    },
    
    async updateProfile(userData) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new URLSearchParams();
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        formData.append('Firstname', userData.firstname);
        formData.append('Surname', userData.surname);
        formData.append('Phone', userData.phone);
        
        if (userData.lastname) formData.append('Lastname', userData.lastname);
        if (userData.description) formData.append('Description', userData.description);
        if (userData.location) formData.append('Location', userData.location);
        
        const response = await apiRequest('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        if (!response.success) {
            if (response.status === 403) {
                throw new Error('Неверные данные авторизации');
            }
            throw new Error('Ошибка сохранения профиля');
        }
        
        return response.data;
    }
};

// ==================== ЖИВОТНЫЕ ====================

const AnimalAPI = {
    async search(params = {}) {
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
        
        const response = await apiRequest(endpoint);
        if (!response.success) return [];
        
        // Если ответ - массив, возвращаем его, иначе пустой массив
        return Array.isArray(response.data) ? response.data : [];
    },
    
    async create(animalData, imageFile) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new FormData();
        formData.append('Type', animalData.type);
        formData.append('Breed', animalData.breed);
        formData.append('Name', animalData.name);
        formData.append('Description', animalData.description);
        formData.append('OrientatedAge', animalData.age);
        formData.append('Cost', animalData.cost || 0);
        formData.append('Sterealized', animalData.sterealized);
        formData.append('image', imageFile);
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        const response = await apiRequest('/api/animal', {
            method: 'POST',
            body: formData
        });
        
        if (!response.success) {
            if (response.status === 403) {
                throw new Error('Ошибка авторизации');
            }
            if (response.status === 409) {
                throw new Error('Животное с таким именем уже существует');
            }
            if (response.status === 422) {
                throw new Error('Не все обязательные поля заполнены');
            }
            throw new Error('Ошибка создания объявления');
        }
        
        return response.data;
    },
    
    async getById(animalId) {
        const response = await apiRequest(`/api/animal/${animalId}`);
        if (!response.success) {
            if (response.status === 404) {
                throw new Error('Животное не найдено');
            }
            throw new Error('Ошибка загрузки');
        }
        return response.data;
    },
    
    async delete(animalId) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new URLSearchParams();
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        const response = await apiRequest(`/api/animal/${animalId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        if (!response.success) {
            if (response.status === 403) {
                throw new Error('Вы не являетесь владельцем этого животного');
            }
            if (response.status === 404) {
                throw new Error('Животное не найдено');
            }
            throw new Error('Ошибка удаления');
        }
        
        return true;
    },
    
    async getUserAnimals(userId, params = {}) {
        if (!userId) return [];
        
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset !== undefined) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `/api/user/${userId}/animals?${queryString}`
            : `/api/user/${userId}/animals`;
        
        const response = await apiRequest(endpoint);
        if (!response.success) return [];
        
        return Array.isArray(response.data) ? response.data : [];
    }
};

// ==================== СБОРЫ И ПОЖЕРТВОВАНИЯ ====================

const FundraiserAPI = {
    async getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset !== undefined) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/fundraisers?${queryString}` : '/api/fundraisers';
        
        const response = await apiRequest(endpoint);
        if (!response.success) return [];
        
        return Array.isArray(response.data) ? response.data : [];
    },
    
    async create(fundraiserData, imageFile) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new FormData();
        formData.append('Title', fundraiserData.title);
        formData.append('TargetAmount', fundraiserData.targetAmount);
        formData.append('Description', fundraiserData.description);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        if (fundraiserData.animalId) {
            formData.append('AnimalID', fundraiserData.animalId);
        }
        
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        const response = await apiRequest('/api/fundraiser', {
            method: 'POST',
            body: formData
        });
        
        if (!response.success) {
            if (response.status === 403) {
                throw new Error('Ошибка авторизации');
            }
            throw new Error('Ошибка создания сбора');
        }
        
        return response.data;
    },
    
    async donate(fundraiserId, amount) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new FormData();
        formData.append('Amount', amount);
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        const response = await apiRequest(`/api/fundraiser/${fundraiserId}/donate`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.success) {
            if (response.status === 400) {
                throw new Error('Сбор не найден или неактивен');
            }
            if (response.status === 403) {
                throw new Error('Ошибка авторизации');
            }
            throw new Error('Ошибка пожертвования');
        }
        
        return response.data;
    },
    
    async getUserDonations(userId, params = {}) {
        if (!userId) return [];
        
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset !== undefined) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `/api/user/${userId}/donations?${queryString}`
            : `/api/user/${userId}/donations`;
        
        const response = await apiRequest(endpoint);
        if (!response.success) return [];
        
        return Array.isArray(response.data) ? response.data : [];
    }
};

// ==================== ЭКСПОРТ ====================

window.API = {
    Auth: AuthAPI,
    User: UserAPI,
    Animal: AnimalAPI,
    FundraiserAPI: FundraiserAPI,  // ← Убедитесь что эта строка есть!
    storage: storage,
    hashPassword: hashPassword
};