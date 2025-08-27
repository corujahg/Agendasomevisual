document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearSpan = document.querySelector('.month-year');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const addEventBtn = document.getElementById('add-event-btn');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const eventForm = document.getElementById('event-form');
    const logoutButton = document.getElementById('logout-button');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let events = [];
    let currentFilter = 'all';

    const API_URL = 'http://localhost:3000/events';

    // Função para buscar eventos da API
    const fetchEvents = async () => {
        try {
            const response = await fetch(API_URL);
            events = await response.json();
            renderCalendar();
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        }
    };

    // Função para renderizar o calendário
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        monthYearSpan.textContent = `${firstDay.toLocaleString('pt-br', { month: 'long' })} de ${currentYear}`;

        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.innerHTML = `<span class="day-number">${day}</span>`;

            const filteredEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === currentYear &&
                       eventDate.getMonth() === currentMonth &&
                       eventDate.getDate() === day &&
                       (currentFilter === 'all' || event.type === currentFilter);
            });

            filteredEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event', event.type);
                eventElement.dataset.id = event.id;
                eventElement.innerHTML = `
                    <strong>${event.type.toUpperCase()}</strong><br>
                    ${event.obs}
                    <div class="event-actions">
                        <button class="edit-btn">Editar</button>
                        <button class="delete-btn">Excluir</button>
                    </div>
                `;
                dayCell.appendChild(eventElement);
            });

            calendarGrid.appendChild(dayCell);
        }
    };

    // Manipulador de botões de navegação
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Manipulador dos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            if (currentFilter === 'all') {
                currentFilter = 'all'; // Manter a lógica de todos os eventos
            }
            renderCalendar();
        });
    });

    // Manipulador do botão de adicionar evento
    addEventBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
    });

    // Manipulador do botão de fechar modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Manipulador para o formulário de evento (Adicionar/Editar)
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventId = document.getElementById('event-id').value;
        const eventDate = document.getElementById('event-date').value;
        const eventType = document.getElementById('event-type').value;
        const eventObs = document.getElementById('event-obs').value;

        const eventData = {
            date: eventDate,
            type: eventType,
            obs: eventObs
        };

        try {
            if (eventId) { // Se o ID existe, é uma edição
                await fetch(`${API_URL}/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            } else { // Se não, é um novo evento
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            }
            modal.style.display = 'none';
            fetchEvents(); // Recarrega os eventos para atualizar o calendário
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
        }
    });

    // Manipulador de cliques para edição e exclusão
    calendarGrid.addEventListener('click', async (e) => {
        const eventElement = e.target.closest('.event');
        if (!eventElement) return;

        const eventId = eventElement.dataset.id;

        if (e.target.classList.contains('edit-btn')) {
            // Lógica para editar
            const eventToEdit = events.find(event => event.id == eventId);
            if (eventToEdit) {
                document.getElementById('event-id').value = eventToEdit.id;
                document.getElementById('event-date').value = eventToEdit.date;
                document.getElementById('event-type').value = eventToEdit.type;
                document.getElementById('event-obs').value = eventToEdit.obs;
                modal.style.display = 'block';
            }
        } else if (e.target.classList.contains('delete-btn')) {
            // Lógica para excluir
            const confirmDelete = confirm('Tem certeza de que deseja excluir este evento?');
            if (confirmDelete) {
                try {
                    await fetch(`${API_URL}/${eventId}`, {
                        method: 'DELETE'
                    });
                    fetchEvents(); // Recarrega os eventos para atualizar o calendário
                } catch (error) {
                    console.error('Erro ao excluir evento:', error);
                }
            }
        }
    });

    // Manipulador do botão Sair
    logoutButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Inicia o calendário ao carregar a página
    fetchEvents();
});