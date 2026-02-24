document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calcBody = document.getElementById('calc-items-body');
    const totalPriceEl = document.getElementById('total-price');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const vatInputs = document.querySelectorAll('input[name="vat"]');

    const detailsModal = document.getElementById('details-modal');
    const orderModal = document.getElementById('order-modal');

    // --- Video Background Logic ---
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
                console.log("No video assets found. Using static background.");
                video.style.opacity = '0';
                const panel = document.querySelector('.hero-panel');
                if (panel) {
                    panel.style.background = 'url("assets/bg.png") center/cover no-repeat fixed';
                }
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
            image: "assets/smart.png",
            desc: "Флагманська модель системи RIGHT FLOW. Забезпечує інтелектуальне внесення рідких добрив з автоматичним дозуванням. <ul><li>Комплект включає:</li><li>Android планшет з передвстановленим ПЗ</li><li>Блок управління та обробки даних</li><li>Електромагнітний витратомір</li><li>Цифровий датчик тиску</li><li>Безконтактний датчик положення агрегату</li><li>Повний комплект монтажних кабелів</li></ul>"
        },
        2: {
            id: 2,
            name: "Візуальний контроль",
            price: 87.12,
            image: "assets/wer.png",
            desc: "Надійне та просте рішення для візуального моніторингу роботи системи. <ul><li>Особливості:</li><li>Комплект прецизійних ротаметрів</li><li>Індивідуальний контроль кожного рядка</li><li>Хімічно стійкі матеріали</li><li>Легке очищення та обслуговування</li></ul>"
        },
        3: {
            id: 3,
            name: "Електронний контроль",
            price: 243.50,
            image: "assets/rtr.png",
            desc: "Електронна система контролю виливу для максимальної точності. <ul><li>Переваги:</li><li>Електронні витратоміри на кожен рядок</li><li>Миттєве сповіщення про забиття</li><li>Точність вимірювання до 0.5%</li><li>Інтеграція з основним терміналом SMART</li></ul>"
        },
        4: {
            id: 4,
            name: "Вузол подачі 2*26",
            price: 2006.00,
            image: "assets/sd.png",
            desc: "Готовий до встановлення насосний модуль високої потужності. <ul><li>Склад вузла:</li><li>Міцний металевий кронштейн</li><li>Два насоси продуктивністю 26 л/хв</li><li>Фільтр тонкої очистки з нержавіючої сіткою</li><li>Набір фітингів та затискачів</li></ul>"
        }
    };

    // Initial cart state is empty
    let cart = [];
    let currentVat = 0;

    // --- Calculator Logic ---

    function updateTotals() {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let total = subtotal * (1 + currentVat / 100);
        totalPriceEl.textContent = `$${total.toFixed(2)}`;

        const summaryInForm = document.getElementById('summary-in-form');
        const hiddenDetails = document.getElementById('order-details-hidden');

        if (summaryInForm) {
            let details = cart.map(i => `${i.name} x${i.qty} ($${(i.price * i.qty).toFixed(2)})`).join('<br>');
            summaryInForm.innerHTML = `<div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; font-size: 0.9rem;">
                <strong>${currentVat > 0 ? 'З ПДВ' : 'Без ПДВ'}:</strong><br>${details}<br><br>
                <strong style="color:var(--accent); font-size: 1.2rem;">Разом: $${total.toFixed(2)}</strong>
            </div>`;

            let plainDetails = cart.map(i => `- ${i.name} x${i.qty}: $${(i.price * i.qty).toFixed(2)}`).join('\n');
            if (hiddenDetails) {
                hiddenDetails.value = `Тип: ${currentVat > 0 ? 'З ПДВ' : 'Без ПДВ'}\n\nСклад:\n${plainDetails}\n\nРазом: $${total.toFixed(2)}`;
            }
        }
    }

    function renderCart() {
        // Sync main buttons state
        document.querySelectorAll('.add-to-calc-btn').forEach(btn => {
            const id = parseInt(btn.dataset.id);
            if (cart.some(i => i.id === id)) {
                btn.classList.add('added');
                btn.textContent = '✓';
            } else {
                btn.classList.remove('added');
                btn.textContent = '+';
            }
        });

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
                    updateTotals();
                    // Update the row total display without full re-render for smoothness
                    const row = e.target.closest('tr');
                    row.cells[2].textContent = `$${(item.price * item.qty).toFixed(2)}`;
                }
            });
        });

        document.querySelectorAll('.rm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart.splice(idx, 1);
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

            // Check if there is a quantity input on the card
            const cardQtyInput = document.querySelector(`.card-qty[data-id="${id}"]`);
            const qtyToAdd = cardQtyInput ? parseInt(cardQtyInput.value) : 1;

            const existing = cart.find(i => i.id === id);
            if (existing) {
                // If it's already in cart, we can either remove or add more. 
                // Let's make it a toggle but if qty input is present, maybe just update qty.
                // Re-aligned with previous behavior: toggle remove if exists, but now support adding specific amount.
                cart = cart.filter(i => i.id !== id);
            } else {
                cart.push({ ...product, qty: qtyToAdd });
            }
            renderCart();
        });
    });

    // --- Modal Logic ---
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

            const modalAdd = document.getElementById('modal-add-btn');
            modalAdd.onclick = () => {
                const mainBtn = document.querySelector(`.add-to-calc-btn[data-id="${id}"]`);
                if (!cart.some(i => i.id === id)) mainBtn.click();
                detailsModal.style.display = 'none';
            };
        });
    });

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

    // --- Stepper Logic (Plus/Minus Buttons) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('step-btn')) {
            const id = parseInt(e.target.dataset.id);
            const input = document.querySelector(`.card-qty[data-id="${id}"]`);
            if (!input) return;

            let val = parseInt(input.value);
            if (e.target.classList.contains('plus')) {
                val++;
            } else if (e.target.classList.contains('minus') && val > 1) {
                val--;
            }
            input.value = val;

            // Update cart if item already exists
            const existing = cart.find(i => i.id === id);
            if (existing) {
                existing.qty = val;
                renderCart();
            }
        }
    });

    // Initial Render
    renderCart();
});
