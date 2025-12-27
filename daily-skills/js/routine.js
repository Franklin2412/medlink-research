class RoutineGame {
    constructor() {
        this.tasks = [
            { id: 1, label: 'Wake Up', emoji: '⏰', order: 1 },
            { id: 2, label: 'Brush Teeth', emoji: '🪥', order: 2 },
            { id: 3, label: 'Get Dressed', emoji: '👕', order: 3 },
            { id: 4, label: 'Eat Breakfast', emoji: '🥣', order: 4 }
        ];
        this.poolSortable = null;
        this.timelineSortables = [];
    }

    start() {
        this.render();
        this.initDragDrop();
    }

    render() {
        const pool = document.getElementById('task-pool');
        pool.innerHTML = '';

        // Shuffle tasks for the pool
        const shuffled = [...this.tasks].sort(() => 0.5 - Math.random());

        shuffled.forEach(task => {
            const div = document.createElement('div');
            div.className = 'routine-task';
            div.dataset.id = task.id;
            div.dataset.order = task.order;
            div.innerHTML = `<div class="task-emoji">${task.emoji}</div><div class="task-label">${task.label}</div>`;
            pool.appendChild(div);
        });

        // Reset slots
        document.querySelectorAll('.timeline-slot').forEach(slot => {
            // Keep the number label
            const label = slot.dataset.index;
            // slot.innerHTML = parseInt(label) + 1;
        });
    }

    initDragDrop() {
        // Initialize pool sortable
        this.poolSortable = new Sortable(document.getElementById('task-pool'), {
            group: 'routine',
            animation: 150
        });

        // Initialize slots
        document.querySelectorAll('.timeline-slot').forEach(slot => {
            new Sortable(slot, {
                group: 'routine',
                animation: 150,
                maxItems: 1,
                onAdd: (evt) => {
                    // If multiple items, send back to pool? Not strictly needed with maxItems
                }
            });
        });
    }

    check() {
        const slots = document.querySelectorAll('.timeline-slot');
        let correctCount = 0;
        let userOrder = [];

        slots.forEach((slot, index) => {
            const task = slot.querySelector('.routine-task');
            if (task) {
                const order = parseInt(task.dataset.order);
                if (order === index + 1) {
                    correctCount++;
                    slot.style.borderColor = 'var(--success-color)';
                } else {
                    slot.style.borderColor = 'var(--accent-orange)';
                }
            } else {
                slot.style.borderColor = 'var(--border-color)';
            }
        });

        if (correctCount === this.tasks.length) {
            const msg = new SpeechSynthesisUtterance("Perfect! You've mastered your morning routine!");
            window.speechSynthesis.speak(msg);
            alert("Perfect! You've mastered your morning routine!");
        } else {
            const msg = new SpeechSynthesisUtterance("Almost there! Check the order of your tasks.");
            window.speechSynthesis.speak(msg);
        }
    }
}
