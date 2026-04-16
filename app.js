//  DOM REFERENCES 
const checkbox = document.getElementById('complete-toggle')
const title = document.querySelector('[data-testid="test-todo-title"]')
const statusBadge = document.querySelector('[data-testid="test-todo-status"]')
const statusControl = document.querySelector('[data-testid="test-todo-status-control"]')
const card = document.querySelector('[data-testid="test-todo-card"]')
const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]')
const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]')
const saveBtn = document.getElementById('save-btn')
const cancelBtn = document.getElementById('cancel-btn')
const timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]')
const timeText = document.querySelector('.time-text')
const description = document.querySelector('[data-testid="test-todo-description"]')
const priorityBadge = document.querySelector('[data-testid="test-todo-priority"]')
const priorityIndicator = document.querySelector('[data-testid="test-todo-priority-indicator"]')
const overdueIndicator = document.getElementById('overdue-indicator')
const dueDateEl = document.querySelector('[data-testid="test-todo-due-date"]')
const editForm = document.getElementById('edit-form')
const editTitleInput = document.getElementById('edit-title')
const editDescInput = document.getElementById('edit-description')
const editPriorityInput = document.getElementById('edit-priority')
const editDueDateInput = document.getElementById('edit-due-date')
const expandToggle = document.getElementById('expand-toggle')
const collapsibleSection = document.getElementById('collapsible-section')

const lucideAvailable = typeof lucide !== 'undefined'

//  ICON HELPER 
function createIcon(name, fallback) {
    if (lucideAvailable) {
        return `<span class="icon"><i data-lucide="${name}"></i></span>`
    }
    return `<span class="emoji-fallback">${fallback}</span>`
}

//  STATE 
const defaults = {
    title: 'Submit Q3 project report',
    description: 'Make sure to include all Q3 data, charts, and the executive summary. This report will be reviewed by leadership and needs to be thorough, well-formatted, and submitted before the deadline without exception. Coordinate with the design team for the visual assets, confirm all financial figures with the finance lead, and ensure the executive summary is no longer than one page. Late submissions will not be accepted under any circumstances.',
    priority: 'High',
    dueDate: '2026-04-16',
    status: 'In Progress'
}

const saved = JSON.parse(localStorage.getItem('todo-card') || 'null')
const state = saved || { ...defaults }

// Ensure status exists for older saved states
if (!state.status) state.status = 'In Progress'

let dueDate = new Date(state.dueDate + 'T23:59:59')
let timerInterval = null

//  HELPERS 
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPriorityColors(priority) {
    if (priority === 'Low') return { bg: 'var(--green-bg)', color: 'var(--green)', indicator: '#16A34A' }
    if (priority === 'Medium') return { bg: 'var(--amber-bg)', color: 'var(--amber)', indicator: '#B45309' }
    return { bg: 'var(--red-bg)', color: 'var(--red)', indicator: '#DC2626' }
}

function getPriorityIcon(priority) {
    if (priority === 'Low') return createIcon('arrow-down', '↓')
    if (priority === 'Medium') return createIcon('minus', '—')
    return createIcon('alert-triangle', '⚠️')
}

//  STATUS SYNC 
// Single source of truth: applyStatus() — always call this to update everything
function applyStatus(newStatus, { fromCheckbox = false, fromControl = false } = {}) {
    state.status = newStatus

    // 1. Sync checkbox
    if (newStatus === 'Done') {
        checkbox.checked = true
    } else if (!fromCheckbox) {
        checkbox.checked = false
    }

    // 2. Sync status control dropdown
    if (!fromControl) {
        statusControl.value = newStatus
    }

    // 3. Sync status badge (display)
    updateStatusBadge(newStatus)

    // 4. Title styling
    if (newStatus === 'Done') {
        title.style.textDecoration = 'line-through'
        title.style.color = '#9CA3AF'
        card.classList.add('is-done')
    } else {
        title.style.textDecoration = 'none'
        title.style.color = 'var(--text-primary)'
        card.classList.remove('is-done')
    }

    // 5. Time remaining: stop or resume
    if (newStatus === 'Done') {
        clearInterval(timerInterval)
        timerInterval = null
        timeText.textContent = 'Completed'
        timeRemaining.style.color = 'var(--green)'
    } else {
        updateTimeRemaining()
        if (!timerInterval) {
            timerInterval = setInterval(updateTimeRemaining, 60000)
        }
    }

    // 6. Persist
    localStorage.setItem('todo-card', JSON.stringify(state))

    if (lucideAvailable) lucide.createIcons()
}

function updateStatusBadge(status) {
    if (status === 'Done') {
        statusBadge.innerHTML = createIcon('check-circle', '✅') + ' Done'
        statusBadge.style.background = 'var(--green-bg)'
        statusBadge.style.color = 'var(--green)'
    } else if (status === 'In Progress') {
        statusBadge.innerHTML = createIcon('clock', '🕐') + ' In Progress'
        statusBadge.style.background = 'var(--amber-bg)'
        statusBadge.style.color = 'var(--amber)'
    } else {
        // Pending
        statusBadge.innerHTML = createIcon('circle', '○') + ' Pending'
        statusBadge.style.background = 'var(--blue-badge-bg)'
        statusBadge.style.color = 'var(--blue-badge-color)'
    }
}

//  PRIORITY RENDER 
function renderPriority(priority) {
    const { bg, color, indicator } = getPriorityColors(priority)

    // Badge
    priorityBadge.innerHTML = getPriorityIcon(priority) + ' <span class="priority-label">' + priority + '</span>'
    priorityBadge.style.background = bg
    priorityBadge.style.color = color

    // Indicator dot
    priorityIndicator.style.background = indicator

    // Card left border accent
    card.style.borderLeftColor = indicator
}

//  FULL CARD RENDER 
function renderCard() {
    title.textContent = state.title
    description.textContent = state.description

    renderPriority(state.priority)

    dueDateEl.innerHTML = `${createIcon('calendar', '📅')} Due ${formatDate(state.dueDate)}`
    dueDateEl.setAttribute('datetime', state.dueDate)

    dueDate = new Date(state.dueDate + 'T23:59:59')

    // Refresh collapsible check
    checkCollapsible()

    // Re-apply status (syncs everything)
    applyStatus(state.status)

    if (lucideAvailable) lucide.createIcons()
}

//  EXPAND / COLLAPSE 
const COLLAPSE_THRESHOLD = 120 // characters

function checkCollapsible() {
    const text = description.textContent.trim()
    if (text.length > COLLAPSE_THRESHOLD) {
        collapsibleSection.classList.add('is-collapsible')
        setCollapsed(true)
        expandToggle.style.display = 'flex'
    } else {
        collapsibleSection.classList.remove('is-collapsible', 'is-collapsed')
        expandToggle.style.display = 'none'
        expandToggle.setAttribute('aria-expanded', 'true')
    }
}

function setCollapsed(collapsed) {
    if (collapsed) {
        collapsibleSection.classList.add('is-collapsed')
        expandToggle.setAttribute('aria-expanded', 'false')
        expandToggle.querySelector('.toggle-text').textContent = 'Show more'
        expandToggle.querySelector('.icon i')?.setAttribute('data-lucide', 'chevron-down')
    } else {
        collapsibleSection.classList.remove('is-collapsed')
        expandToggle.setAttribute('aria-expanded', 'true')
        expandToggle.querySelector('.toggle-text').textContent = 'Show less'
        expandToggle.querySelector('.icon i')?.setAttribute('data-lucide', 'chevron-up')
    }
    if (lucideAvailable) lucide.createIcons()
}

expandToggle.addEventListener('click', () => {
    const isExpanded = expandToggle.getAttribute('aria-expanded') === 'true'
    setCollapsed(isExpanded)
})

//  TIME REMAINING 
function updateTimeRemaining() {
    // Don't update if Done
    if (state.status === 'Done') return

    const now = new Date()
    const diff = dueDate - now
    const minutes = Math.floor(Math.abs(diff) / (1000 * 60))
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60))
    const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24))

    let text = ''
    const isOverdue = diff < 0

    if (isOverdue) {
        if (minutes < 60) text = `Overdue by ${minutes} minute${minutes !== 1 ? 's' : ''}`
        else if (hours < 24) text = `Overdue by ${hours} hour${hours !== 1 ? 's' : ''}`
        else text = `Overdue by ${days} day${days !== 1 ? 's' : ''}`

        timeRemaining.style.color = 'var(--red)'

        // Update status badge to Overdue only if not Done
        statusBadge.innerHTML = createIcon('alert-circle', '🔴') + ' Overdue'
        statusBadge.style.background = 'var(--red-bg)'
        statusBadge.style.color = 'var(--red)'

    } else {
        overdueIndicator.style.display = 'none'

        const fewMins = diff / (1000 * 60)
        if (fewMins < 60) text = `Due in ${Math.floor(fewMins)} minute${Math.floor(fewMins) !== 1 ? 's' : ''}`
        else if (hours < 24) text = `Due in ${hours} hour${hours !== 1 ? 's' : ''}`
        else if (days === 1) text = 'Due tomorrow'
        else text = `Due in ${days} days`

        if (days <= 1 && hours < 24) timeRemaining.style.color = 'var(--red)'
        else if (days <= 3) timeRemaining.style.color = 'var(--amber)'
        else timeRemaining.style.color = 'var(--green)'

        // Restore status badge based on current status if not overdue
        updateStatusBadge(state.status)
    }

    timeText.textContent = text
    if (lucideAvailable) lucide.createIcons()
}

//  EVENT: STATUS CONTROL 
statusControl.addEventListener('change', () => {
    applyStatus(statusControl.value, { fromControl: true })
})

//  EVENT: CHECKBOX 
checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        applyStatus('Done', { fromCheckbox: true })
    } else {
        // Unchecking Done → revert to Pending
        applyStatus('Pending', { fromCheckbox: true })
    }
})

//  EDIT MODE ─
let isEditing = false
let snapshot = null // stores state before editing, for cancel

function enterEditMode() {
    isEditing = true
    // Snapshot current state for cancel
    snapshot = { ...state }

    editTitleInput.value = state.title
    editDescInput.value = state.description
    editPriorityInput.value = state.priority
    editDueDateInput.value = state.dueDate

    editForm.style.display = 'flex'
    editBtn.setAttribute('aria-label', 'Currently editing')
    editBtn.disabled = true // disable while form is open — use Save/Cancel instead

    // Focus first field
    editTitleInput.focus()
}

function saveEdit() {
    state.title = editTitleInput.value.trim() || defaults.title
    state.description = editDescInput.value.trim() || defaults.description
    state.priority = editPriorityInput.value
    state.dueDate = editDueDateInput.value || defaults.dueDate

    localStorage.setItem('todo-card', JSON.stringify(state))
    renderCard()
    exitEditMode()
}

function cancelEdit() {
    // Restore snapshot
    Object.assign(state, snapshot)
    exitEditMode()
}

function exitEditMode() {
    isEditing = false
    snapshot = null
    editForm.style.display = 'none'
    editBtn.disabled = false
    editBtn.setAttribute('aria-label', 'Edit task')
    editBtn.focus()
}

editBtn.addEventListener('click', () => {
    if (!isEditing) enterEditMode()
})

saveBtn.addEventListener('click', saveEdit)
cancelBtn.addEventListener('click', cancelEdit)

// Trap Enter key in form → Save (not on textarea)
editForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && !e.shiftKey) {
        e.preventDefault()
        saveEdit()
    }
    if (e.key === 'Escape') {
        cancelEdit()
    }
})

//  EVENT: DELETE 
deleteBtn.addEventListener('click', () => {
    clearInterval(timerInterval)
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

//  INIT 
renderCard()
timerInterval = setInterval(updateTimeRemaining, 60000)