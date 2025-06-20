
document.addEventListener('DOMContentLoaded', function () {
    if (!sessionStorage.getItem('currentUser')) {
        window.location.href = 'main_file.html';
    }
});