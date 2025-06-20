document.addEventListener('DOMContentLoaded', function() {
    // Находим элементы формы
    const loginForm = document.querySelector('.form-container');
    const usernameInput = loginForm.querySelector('input[type="text"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const submitButton = loginForm.querySelector('.button_1');
    const errorElement = document.createElement('p');
    errorElement.style.color = 'red';
    errorElement.style.marginTop = '10px';
    loginForm.insertBefore(errorElement, submitButton.nextSibling);

    // Удаляем стандартное поведение ссылки
    const linkInsideButton = submitButton.querySelector('a');
    linkInsideButton.removeAttribute('href');
    linkInsideButton.style.pointerEvents = 'none';

    // Обработчик клика по кнопке "Войти"
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Проверка заполненности полей
        if (!username || !password) {
            errorElement.textContent = 'Все поля должны быть заполнены!';
            return;
        }

        // Получаем пользователей из localStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        // Поиск пользователя
        let userFound = false;
        for (const userId in users) {
            if (users[userId].login === username && users[userId].password === password) {
                userFound = true;
                // Сохраняем данные текущего пользователя
                sessionStorage.setItem('currentUser', JSON.stringify({
                    username: users[userId].name,
                    login: users[userId].login
                }));
                break;
            }
        }

        if (userFound) {
            // Перенаправляем только после успешной авторизации
            window.location.href = 'main_file.html';
        } else {
            errorElement.textContent = 'Неверный логин или пароль!';
        }
    });

    // Убираем ошибку при начале ввода
    usernameInput.addEventListener('input', () => errorElement.textContent = '');
    passwordInput.addEventListener('input', () => errorElement.textContent = '');
});