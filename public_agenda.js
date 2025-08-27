document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthYearSpan = document.querySelector('.month-year');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentDate = new Date();
    let events = [];
    let activeFilters = new Set();
    filterBtns.forEach(btn => activeFilters.add(btn.dataset.filter));

    async function fetchEvents() {
        try {
            const response = await fetch('http://localhost:3000/events');
            if (!response.ok) {
                throw new Error('Erro ao buscar eventos: ' + response.statusText);
            }
            events = await response.json();
            renderCalendar();
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        }
    }
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();

        monthYearSpan.textContent = `${firstDay.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}`;
        calendarGrid.innerHTML = '';

        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell');
            emptyCell.style.border = 'none';
            calendarGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.innerHTML = `<span class="day-number">${i}</span>`;
            
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date + 'T00:00:00');
                return eventDate.getDate() === i && eventDate.getMonth() === month && eventDate.getFullYear() === year;
            });

            dayEvents.forEach(eventData => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event', eventData.type);
                if (!activeFilters.has(eventData.type)) {
                    eventDiv.classList.add('hidden');
                }
                eventDiv.innerHTML = `
                    <strong>NO STUDIO SOM E VISUAL</strong><br>
                    GUADALUPE<br>
                    ${eventData.observacao ? `<em>${eventData.observacao}</em>` : ''}
                `;
                dayCell.appendChild(eventDiv);
            });

            calendarGrid.appendChild(dayCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (activeFilters.has(filter)) {
                activeFilters.delete(filter);
                btn.classList.remove('active');
            } else {
                activeFilters.add(filter);
                btn.classList.add('active');
            }
            
            const allEvents = document.querySelectorAll('.event');
            allEvents.forEach(event => {
                const eventType = event.classList[1];
                if (activeFilters.has(eventType)) {
                    event.classList.remove('hidden');
                } else {
                    event.classList.add('hidden');
                }
            });
        });
    });

    filterBtns.forEach(btn => btn.classList.add('active'));
    fetchEvents();
});