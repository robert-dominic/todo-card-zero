const checkbox = document.getElementById('complete-toggle')
const title = document.querySelector('[data-testid="test-todo-title"]')
const statusBadge = document.querySelector('[data-testid="test-todo-status"]')
const card = document.querySelector('[data-testid="test-todo-card"]')
const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]')
const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]')
const timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]')
const timeText = document.querySelector('.time-text')
const description = document.querySelector('[data-testid="test-todo-description"]')
const priorityBadge = document.querySelector('[data-testid="test-todo-priority"]')
const dueDateEl = document.querySelector('[data-testid="test-todo-due-date"]')
const editForm = document.getElementById('edit-form')
const editTitleInput = document.getElementById('edit-title')
const editDescInput = document.getElementById('edit-description')
const editPriorityInput = document.getElementById('edit-priority')
const editDueDateInput = document.getElementById('edit-due-date')

const lucideAvailable = typeof lucide !== 'undefined'

function createIcon(name, fallback) {
    if (lucideAvailable) {
        return `<span class="icon"><i data-lucide="${name}"></i></span>`
    }
    return `<span class="emoji-fallback">${fallback}</span>`
}

// Load from localStorage or use defaults
const defaults = {
    title: 'Submit Q3 project report',
    description: 'Make sure to include all Q3 data, charts, and the executive summary.',
    priority: 'High',
    dueDate: '2026-04-16'
}

const saved = JSON.parse(localStorage.getItem('todo-card') || 'null')
const state = saved || { ...defaults }

// Time remaining
let dueDate = new Date(state.dueDate + 'T09:00:00')

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPriorityColors(priority) {
    if (priority === 'Low') return { bg: 'var(--green-bg)', color: 'var(--green)' }
    if (priority === 'Medium') return { bg: 'var(--amber-bg)', color: 'var(--amber)' }
    return { bg: 'var(--red-bg)', color: 'var(--red)' }
}

function renderCard() {
    title.textContent = state.title
    description.textContent = state.description

    const { bg, color } = getPriorityColors(state.priority)
    priorityBadge.innerHTML = createIcon('alert-triangle', '⚠️') + ' ' + state.priority
    priorityBadge.style.background = bg
    priorityBadge.style.color = color

    dueDateEl.innerHTML = `${createIcon('calendar', '📅')} Due ${formatDate(state.dueDate)}`
    dueDateEl.setAttribute('datetime', state.dueDate)

    if (lucideAvailable) lucide.createIcons()

    dueDate = new Date(state.dueDate + 'T09:00:00')
    updateTimeRemaining()
}

renderCard()

// Edit mode
let isEditing = false

editBtn.addEventListener('click', () => {
    if (!isEditing) {
        // Enter edit mode
        isEditing = true
        editTitleInput.value = state.title
        editDescInput.value = state.description
        editPriorityInput.value = state.priority
        editDueDateInput.value = state.dueDate

        editForm.style.display = 'flex'
        editBtn.textContent = 'Save'
        editBtn.classList.add('save-mode')
        deleteBtn.textContent = 'Cancel'
        deleteBtn.classList.add('cancel-mode')

    } else {
        // Save
        state.title = editTitleInput.value.trim() || defaults.title
        state.description = editDescInput.value.trim() || defaults.description
        state.priority = editPriorityInput.value
        state.dueDate = editDueDateInput.value || defaults.dueDate

        localStorage.setItem('todo-card', JSON.stringify(state))
        renderCard()
        exitEditMode()
    }
})

deleteBtn.addEventListener('click', () => {
    if (isEditing) {
        exitEditMode()
        return
    }

    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
    card.style.opacity = '0'
    card.style.transform = 'scale(0.95)'

    setTimeout(() => {
        card.innerHTML = `
      <div class="deleted-message">
        <span style="font-size:32px">🗑️</span>
        <p>Card deleted.</p>
        <span>Refresh the page to restore it.</span>
      </div>
    `
        card.style.opacity = '1'
        card.style.transform = 'scale(1)'
    }, 400)
})

function exitEditMode() {
    isEditing = false
    editForm.style.display = 'none'
    editBtn.textContent = 'Edit'
    editBtn.classList.remove('save-mode')
    deleteBtn.textContent = 'Delete'
    deleteBtn.classList.remove('cancel-mode')
}

// Checkbox
checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        title.style.textDecoration = 'line-through'
        title.style.color = '#9CA3AF'
        statusBadge.innerHTML = createIcon('check-circle', '✅') + ' Done'
        statusBadge.style.background = 'var(--green-bg)'
        statusBadge.style.color = 'var(--green)'
    } else {
        title.style.textDecoration = 'none'
        title.style.color = 'var(--text-primary)'
        statusBadge.innerHTML = createIcon('clock', '🕐') + ' In Progress'
        statusBadge.style.background = 'var(--blue-badge-bg)'
        statusBadge.style.color = 'var(--blue-badge-color)'
    }
    if (lucideAvailable) lucide.createIcons()
})

function updateTimeRemaining() {
    const now = new Date()
    const diff = dueDate - now

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    let text = ''

    if (diff < 0) {
        const overdueMins = Math.abs(minutes)
        const overdueHours = Math.abs(hours)
        const overdueDays = Math.abs(days)

        if (overdueMins < 60) text = `Overdue by ${overdueMins} minutes`
        else if (overdueHours < 24) text = `Overdue by ${overdueHours} hours`
        else text = `Overdue by ${overdueDays} days`

        statusBadge.innerHTML = createIcon('alert-circle', '🔴') + ' Overdue'
        statusBadge.style.background = 'var(--red-bg)'
        statusBadge.style.color = 'var(--red)'
        timeRemaining.style.color = 'var(--red)'

    } else {
        if (minutes < 60) text = 'Due now!'
        else if (hours < 24) text = `Due in ${hours} hours`
        else if (days === 1) text = 'Due tomorrow'
        else text = `Due in ${days} days`

        if (days <= 3) timeRemaining.style.color = 'var(--amber)'
        else timeRemaining.style.color = 'var(--green)'
    }

    timeText.textContent = text
    if (lucideAvailable) lucide.createIcons()
}

updateTimeRemaining()
setInterval(updateTimeRemaining, 60000)