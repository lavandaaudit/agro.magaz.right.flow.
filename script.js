document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calcBody = document.getElementById('calc-items-body');
    const totalPriceEl = document.getElementById('total-price');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const vatInputs = document.querySelectorAll('input[name="vat"]');

    const detailsModal = document.getElementById('details-modal');
    const orderModal = document.getElementById('order-modal');

    // --- Video Background Logic (Fixed to avoid infinite loops) ---
    const video = document.getElementById('hero-video');
    let currentVideoIdx = 1;
    let retryCount = 0;
    const totalVideos = 10;

    function playNextVideo() {
        if (!video) return;
        video.src = `assets/${currentVideoIdx}.mp4`;
        video.load();
        video.play().catch(() => {
            retryCount++;
            if (retryCount <= totalVideos) {
                setTimeout(skipToNext, 100);
            } else {
                console.log("No video assets found, stopping search.");
                video.style.display = 'none'; // Only hide the video element
                const overlay = document.querySelector('.video-overlay');
                if (overlay) overlay.style.display = 'none'; // Also hide video-specific overlay
            }
        });
    }

    function skipToNext() {
        currentVideoIdx++;
        if (currentVideoIdx > totalVideos) currentVideoIdx = 1;
        playNextVideo();
    }

    if (video) {
        video.onended = skipToNext;
        video.onerror = skipToNext;
        playNextVideo();
    }

    // Product Data
    const products = {
        1: {
            id: 1,
            name: "Right Flow SMART",
            price: 3465.00,
            image: "assets/smart.jpg",
            desc: "Флагманська модель системи RIGHT FLOW. Забезпечує інтелектуальне внесення рідких добрив з автоматичним дозуванням. <ul><li>Комплект включає:</li><li>Android планшет з передвстановленим ПЗ</li><li>Блок управління та обробки даних</li><li>Електромагнітний витратомір</li><li>Цифровий датчик тиску</li><li>Безконтактний датчик положення агрегату</li><li>Повний комплект монтажних кабелів</li></ul>"
        },
        2: {
            id: 2,
            name: "Візуальний контроль",
            price: 87.12,
            image: "assets/visual.png",
            desc: "Надійне та просте рішення для візуального моніторингу роботи системи. <ul><li>Особливості:</li><li>Комплект прецизійних ротаметрів</li><li>Індивідуальний контроль кожного рядка</li><li>Хімічно стійкі матеріали</li><li>Легке очищення та обслуговування</li></ul>"
        },
        3: {
            id: 3,
            name: "Електронний контроль",
            price: 243.50,
            image: "assets/visual.png", // placeholder
            desc: "Електронна система контролю виливу для максимальної точності. <ul><li>Переваги:</li><li>Електронні витратоміри на кожен рядок</li><li>Миттєве сповіщення про забиття</li><li>Точність вимірювання до 0.5%</li><li>Інтеграція з основним терміналом SMART</li></ul>"
        },
        4: {
            id: 4,
            name: "Вузол подачі 2*26",
            price: 2006.00,
            image: "assets/visual.png", // placeholder
            desc: "Готовий до встановлення насосний модуль високої потужності. <ul><li>Склад вузла:</li><li>Міцний металевий кронштейн</li><li>Два насоси продуктивністю 26 л/хв</li><li>Фільтр тонкої очистки з нержавіючої сіткою</li><li>Набір фітингів та затискачів</li></ul>"
        }
    };

    let cart = [];
    let currentVat = 0;

    // --- Calculator Logic ---

    function updateTotals() {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let total = subtotal * (1 + currentVat / 100);
        totalPriceEl.textContent = `$${total.toFixed(2)}`;

        // Update order form summary
        const summaryInForm = document.getElementById('summary-in-form');
        const hiddenDetails = document.getElementById('order-details-hidden');

        if (summaryInForm) {
            let details = cart.map(i => `${i.name} x${i.qty} ($${(i.price * i.qty).toFixed(2)})`).join('<br>');
            summaryInForm.innerHTML = `<strong>Склад замовлення (${currentVat > 0 ? 'з ПДВ' : 'без ПДВ'}):</strong><br>${details}<br><br><strong>Разом: $${total.toFixed(2)}</strong>`;

            // Plain text for email
            let plainDetails = cart.map(i => `- ${i.name} x${i.qty}: $${(i.price * i.qty).toFixed(2)}`).join('\n');
            if (hiddenDetails) {
                hiddenDetails.value = `Тип рахунку: ${currentVat > 0 ? 'З ПДВ' : 'Без ПДВ'}\n\nСклад:\n${plainDetails}\n\nРазом: $${total.toFixed(2)}`;
            }
        }
    }

    function renderCart() {
        if (cart.length === 0) {
            calcBody.innerHTML = '';
            emptyMsg.style.display = 'block';
            updateTotals();
            return;
        }

        emptyMsg.style.display = 'none';
        calcBody.innerHTML = '';

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" class="qty-input" value="${item.qty}" min="1" data-id="${item.id}">
                </td>
                <td>$${(item.price * item.qty).toFixed(2)}</td>
                <td style="text-align:right">
                    <button class="rm-btn" data-index="${index}">&times;</button>
                </td>
            `;
            calcBody.appendChild(row);
        });

        // Add Listeners
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const val = parseInt(e.target.value);
                const item = cart.find(i => i.id === id);
                if (item && val > 0) {
                    item.qty = val;
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.rm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const removedId = cart[idx].id;
                cart.splice(idx, 1);

                // Reset main button if no more in cart
                if (!cart.some(i => i.id === removedId)) {
                    const mainBtn = document.querySelector(`.add-to-calc-btn[data-id="${removedId}"]`);
                    if (mainBtn) {
                        mainBtn.classList.remove('added');
                        mainBtn.textContent = 'Додати до розрахунку';
                    }
                }
                renderCart();
            });
        });

        updateTotals();
    }

    // --- VAT Toggle ---
    vatInputs.forEach(input => {
        input.addEventListener('change', () => {
            currentVat = parseInt(document.querySelector('input[name="vat"]:checked').value);
            updateTotals();
        });
    });

    // --- Product Selection ---
    document.querySelectorAll('.add-to-calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const product = products[id];

            const existing = cart.find(i => i.id === id);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ ...product, qty: 1 });
            }

            btn.classList.add('added');
            btn.textContent = 'У сметі ✓';
            renderCart();
        });
    });

    // --- Modal Logic (Details) ---
    document.querySelectorAll('.open-details').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const product = products[id];

            document.getElementById('modal-title').textContent = product.name;
            document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
            document.getElementById('modal-desc').innerHTML = product.desc;
            const modalImg = document.getElementById('modal-img');
            modalImg.src = product.image;
            modalImg.alt = product.name;

            detailsModal.style.display = 'block';

            // Modal Add button
            const modalAdd = document.getElementById('modal-add-btn');
            modalAdd.onclick = () => {
                const mainBtn = document.querySelector(`.add-to-calc-btn[data-id="${id}"]`);
                mainBtn.click();
                detailsModal.style.display = 'none';
            };
        });
    });

    // --- Header / Main Modal logic ---
    document.querySelectorAll('.open-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Смета порожня!');
                return;
            }
            orderModal.style.display = 'block';
        });
    });

    document.querySelectorAll('.close-modal, .close-details').forEach(btn => {
        btn.addEventListener('click', () => {
            detailsModal.style.display = 'none';
            orderModal.style.display = 'none';
        });
    });

    window.onclick = (e) => {
        if (e.target === detailsModal) detailsModal.style.display = 'none';
        if (e.target === orderModal) orderModal.style.display = 'none';
    };

    // --- Form Submission ---
    document.getElementById('order-form').addEventListener('submit', (e) => {
        // We let the form submit to FormSubmit.co
        const name = document.getElementById('name').value;
        const total = totalPriceEl.textContent;
        // The page will redirect to FormSubmit, so we just log or show a temporary msg
        console.log('Sending order for ' + name);
    });
});
