let nameInput = document.querySelector('#name');
let loginInput = document.querySelector('#login');
let passwordInput = document.querySelector('#password');
let submitBtn = document.querySelector('#submit');
let errorElement = document.querySelector('#error');

// Загружаем пользователей из localStorage (если есть)
let users = JSON.parse(localStorage.getItem('users')) || {};

function User(name, login, password) {
    this.name = name;
    this.login = login;
    this.password = password;
}

function createId(users) {
    return Object.keys(users).length;
}

submitBtn.addEventListener('click', () => {
    // Получаем значения полей (исправлено на .value)
    const nameUser = nameInput.value.trim();
    const loginUser = loginInput.value.trim();
    const passwordUser = passwordInput.value.trim();

    // Валидация
    if (!nameUser || !loginUser || !passwordUser) {
        errorElement.textContent = 'Все поля обязательны для заполнения!';
        return;
    }

    // Проверяем, нет ли уже такого логина
    for (let id in users) {
        if (users[id].login === loginUser) {
            errorElement.textContent = 'Пользователь с таким логином уже существует!';
            return;
        }
    }

    // Создаем пользователя
    const user = new User(nameUser, loginUser, passwordUser);
    const userId = 'User' + createId(users);
    users[userId] = user;

    // Сохраняем в localStorage
    localStorage.setItem('users', JSON.stringify(users));

    console.log(users);
    alert(`${nameUser}, вы ступили на темную сторону`);

    // Перенаправляем на другую страницу (если нужно)
    window.location.href = 'main_file.html';
});