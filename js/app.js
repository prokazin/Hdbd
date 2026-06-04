// Загрузка конфигов и данных
let currentCategory = 'all';
let products = [];

// Загружаем данные из JSON-файлов
async function loadData() {
    try {
        const [catalogRes, categoriesRes] = await Promise.all([
            fetch('data/catalog.json'),
            fetch('config/categories.json')
        ]);
        products = await catalogRes.json();
        const categories = await categoriesRes.json();
        renderCategoryButtons(categories);
        renderProducts();
    } catch(e) {
        console.error('Ошибка загрузки:', e);
        document.getElementById('catalog').innerHTML = '<p>Ошибка загрузки каталога</p>';
    }
}

function renderCategoryButtons(categories) {
    const container = document.getElementById('categoryButtons');
    let html = `<button class="cat-btn" data-cat="all">Все</button>`;
    categories.forEach(cat => {
        html += `<button class="cat-btn" data-cat="${cat.name}">${cat.icon} ${cat.name}</button>`;
    });
    container.innerHTML = html;
    
    // Навешиваем обработчики
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = btn.dataset.cat;
            renderProducts();
        });
    });
}

function renderProducts() {
    const container = document.getElementById('catalog');
    let filtered = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>Товаров в этой категории нет</p>';
        return;
    }
    
    let html = '';
    filtered.forEach(p => {
        html += `
            <div class="card">
                <img src="${p.photo}" alt="${p.name}" onerror="this.src='https://placehold.co/100x100?text=Фото+не+загружено'">
                <div style="flex:1">
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <div class="price">${p.price.toLocaleString()} ₽</div>
                    ${p.inStock ? '<button class="contact-btn" data-sku="'+p.sku+'">📞 Уточнить</button>' : '<span style="color:gray">Нет в наличии</span>'}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    
    // Обработка кнопок "Уточнить" — через WebApp открываем чат с продавцом
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sku = btn.dataset.sku;
            if (window.Telegram && Telegram.WebApp) {
                Telegram.WebApp.openTelegramLink(`https://t.me/ваш_юзернейм_бота?start=ask_${sku}`);
            } else {
                alert('Откройте приложение в Telegram для связи с продавцом');
            }
        });
    });
}

loadData();
