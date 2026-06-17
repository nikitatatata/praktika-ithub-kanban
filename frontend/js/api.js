// js/api.js - Модуль для работы с API

// ==================== ХЕШИРОВАНИЕ ПАРОЛЯ ====================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    
    // Не устанавливаем Content-Type для FormData (браузер сам установит с boundary)
    if (!(options.body instanceof FormData)) {
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
    }
    
    try {
        const response = await fetch(endpoint, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        // 204 No Content
        if (response.status === 204) {
            return null;
        }
        
        // Пробуем распарсить как JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        // Иначе возвращаем текст
        const text = await response.text();
        
        // Пробуем распарсить как boolean
        if (text === 'true') return true;
        if (text === 'false') return false;
        
        return text;
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
        
        if (response === true) {
            // Временно userId = null, получим позже
            storage.setCredentials(email, passwordHash, null);
            return true;
        }
        
        return false;
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
        
        if (response === true) {
            storage.setCredentials(userData.email, passwordHash, null);
            return true;
        }
        
        return false;
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
        return await apiRequest(`/api/user/${userId}`);
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
        
        return await apiRequest('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
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
        if (params.offset) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/animal?${queryString}` : '/api/animal';
        
        return await apiRequest(endpoint);
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
        
        return await apiRequest('/api/animal', {
            method: 'POST',
            body: formData
        });
    },
    
    async getById(animalId) {
        return await apiRequest(`/api/animal/${animalId}`);
    },
    
    async delete(animalId) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new URLSearchParams();
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        return await apiRequest(`/api/animal/${animalId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
    },
    
    async getUserAnimals(userId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString 
            ? `/api/user/${userId}/animals?${queryString}` 
            : `/api/user/${userId}/animals`;
        
        return await apiRequest(endpoint);
    }
};

// ==================== СБОРЫ И ПОЖЕРТВОВАНИЯ ====================

const FundraiserAPI = {
    async getAll(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/fundraisers?${queryString}` : '/api/fundraisers';
        
        return await apiRequest(endpoint);
    },
    
    async create(fundraiserData) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new FormData();
        formData.append('TargetAmount', fundraiserData.targetAmount);
        formData.append('Description', fundraiserData.description);
        
        if (fundraiserData.animalId) {
            formData.append('AnimalID', fundraiserData.animalId);
        }
        
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        return await apiRequest('/api/fundraiser', {
            method: 'POST',
            body: formData
        });
    },
    
    async donate(fundraiserId, amount) {
        const credentials = storage.getCredentials();
        if (!credentials) throw new Error('Not authenticated');
        
        const formData = new FormData();
        formData.append('Amount', amount);
        formData.append('Email', credentials.email);
        formData.append('PasswordHash', credentials.passwordHash);
        
        return await apiRequest(`/api/fundraiser/${fundraiserId}/donate`, {
            method: 'POST',
            body: formData
        });
    },
    
    async getUserDonations(userId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
        
        const queryString = queryParams.toString();
        const endpoint = queryString 
            ? `/api/user/${userId}/donations?${queryString}` 
            : `/api/user/${userId}/donations`;
        
        return await apiRequest(endpoint);
    }
};

// ==================== ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ====================

window.API = {
    Auth: AuthAPI,
    User: UserAPI,
    Animal: AnimalAPI,
    Fundraiser: FundraiserAPI,
    storage: storage,
    hashPassword: hashPassword
};