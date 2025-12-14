const API_URL = 'https://jsonplaceholder.typicode.com/users';

const validators = {
    username: (value) => {
        if (!value) return 'Потребителското име е задължително';
        if (value.length < 3 || value.length > 10) {
            return 'Потребителското име трябва да е между 3 и 10 символа';
        }
        return '';
    },
    
    name: (value) => {
        if (!value) return 'Името е задължително';
        if (value.length > 50) return 'Името не може да бъде повече от 50 символа';
        return '';
    },
    
    familyName: (value) => {
        if (!value) return 'Фамилията е задължителна';
        if (value.length > 50) return 'Фамилията не може да бъде повече от 50 символа';
        return '';
    },
    
    email: (value) => {
        if (!value) return 'Имейлът е задължителен';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Невалиден имейл формат';
        return '';
    },
    
    password: (value) => {
        if (!value) return 'Паролата е задължителна';
        if (value.length < 6 || value.length > 10) {
            return 'Паролата трябва да е между 6 и 10 символа';
        }
        if (!/[a-z]/.test(value)) return 'Паролата трябва да съдържа малки букви';
        if (!/[A-Z]/.test(value)) return 'Паролата трябва да съдържа главни букви';
        if (!/[0-9]/.test(value)) return 'Паролата трябва да съдържа цифри';
        return '';
    },
    
    postalCode: (value) => {
        if (!value) return '';
        const postalRegex = /^(\d{5}|\d{5}-\d{4})$/;
        if (!postalRegex.test(value)) {
            return 'Невалиден пощенски код. Формат: 11111 или 11111-1111';
        }
        return '';
    }
};

const showError = (fieldId, message) => {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        if (message) {
            inputElement.classList.add('invalid');
        } else {
            inputElement.classList.remove('invalid');
        }
    }
};

const clearErrors = () => {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(el => el.textContent = '');
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('invalid'));
};

const validateField = (fieldId, value, validatorKey) => {
    const error = validators[validatorKey](value);
    showError(fieldId, error);
    return !error;
};

const validateForm = () => {
    clearErrors();
    
    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    const familyName = document.getElementById('family-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const postalCode = document.getElementById('postal-code').value.trim();
    
    const isUsernameValid = validateField('username', username, 'username');
    const isNameValid = validateField('name', name, 'name');
    const isFamilyNameValid = validateField('family-name', familyName, 'familyName');
    const isEmailValid = validateField('email', email, 'email');
    const isPasswordValid = validateField('password', password, 'password');
    const isPostalCodeValid = validateField('postal-code', postalCode, 'postalCode');
    
    return isUsernameValid && isNameValid && isFamilyNameValid && 
           isEmailValid && isPasswordValid && isPostalCodeValid;
};

const checkUserExists = async (username) => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Грешка при извличане на потребители');
        
        const users = await response.json();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    } catch (error) {
        console.error('Грешка при проверка за съществуващ потребител:', error);
        throw error;
    }
};

const registerUser = async (userData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Грешка при регистрация');
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Грешка при регистрация:', error);
        throw error;
    }
};

const showSuccessMessage = (message) => {
    const successElement = document.getElementById('success-message');
    successElement.textContent = message;
    successElement.classList.add('show');
    
    setTimeout(() => {
        successElement.classList.remove('show');
    }, 5000);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('register-btn');
    submitBtn.disabled = true;
    
    try {
        if (!validateForm()) {
            submitBtn.disabled = false;
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const name = document.getElementById('name').value.trim();
        const familyName = document.getElementById('family-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const street = document.getElementById('street').value.trim();
        const city = document.getElementById('city').value.trim();
        const postalCode = document.getElementById('postal-code').value.trim();
        
        const userExists = await checkUserExists(username);
        
        if (userExists) {
            showError('username', 'Потребител с това потребителско име вече съществува');
            submitBtn.disabled = false;
            return;
        }
        
        const userData = {
            username: username,
            name: `${name} ${familyName}`,
            email: email,
            address: {
                street: street,
                city: city,
                zipcode: postalCode
            }
        };
        
        const result = await registerUser(userData);
        console.log('Регистрация успешна:', result);
        
        document.getElementById('registration-form').reset();
        clearErrors();
        showSuccessMessage(`Успешна регистрация! Потребител "${username}" е създаден.`);
        
    } catch (error) {
        console.error('Грешка в handleSubmit:', error);
        showError('username', 'Възникна грешка при регистрацията. Моля, опитайте отново.');
    } finally {
        submitBtn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    form.addEventListener('submit', handleSubmit);
    
    const inputs = ['username', 'name', 'family-name', 'email', 'password', 'postal-code'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('blur', () => {
            const value = element.value.trim();
            let validatorKey = id;
            if (id === 'family-name') validatorKey = 'familyName';
            if (id === 'postal-code') validatorKey = 'postalCode';
            
            if (validators[validatorKey]) {
                validateField(id, id === 'password' ? element.value : value, validatorKey);
            }
        });
    });
});