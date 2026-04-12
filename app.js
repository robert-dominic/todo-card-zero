const checkbox = document.getElementById('complete-toggle')
const title = document.querySelector('[data-testid="test-todo-title"]')
const statusBadge = document.querySelector('[data-testid="test-todo-status"]')
const card = document.querySelector('[data-testid="test-todo-card"]')
const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]')
const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]')
const timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]')
const timeText = document.querySelector('.time-text')

const lucideAvailable = typeof lucide !== 'undefined'

function createIcon(name, fallback) {
    if (lucideAvailable) {
        return `<span class="icon"><i data-lucide="${name}"></i></span>`
    }
    return `<span class="emoji-fallback">${fallback}</span>`
}

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

const dueDate = new Date('2026-04-16T09:00:00')

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

editBtn.addEventListener('click', () => {
    console.log('edit clicked')
})

deleteBtn.addEventListener('click', () => {
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