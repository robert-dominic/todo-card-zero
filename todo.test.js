const fs = require('fs')
const path = require('path')

beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8')
    document.documentElement.innerHTML = html
})

test('all required data-testid elements exist', () => {
    const ids = [
        'test-todo-card',
        'test-todo-title',
        'test-todo-description',
        'test-todo-priority',
        'test-todo-status',
        'test-todo-due-date',
        'test-todo-time-remaining',
        'test-todo-complete-toggle',
        'test-todo-tags',
        'test-todo-edit-button',
        'test-todo-delete-button'
    ]

    ids.forEach(id => {
        const el = document.querySelector(`[data-testid="${id}"]`)
        expect(el).not.toBeNull()
    })
})

test('checkbox is a real input type checkbox', () => {
    const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]')
    expect(checkbox.tagName).toBe('INPUT')
    expect(checkbox.type).toBe('checkbox')
})

test('tags exist', () => {
    expect(document.querySelector('[data-testid="test-todo-tag-work"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="test-todo-tag-urgent"]')).not.toBeNull()
})

test('edit and delete are buttons', () => {
    const edit = document.querySelector('[data-testid="test-todo-edit-button"]')
    const del = document.querySelector('[data-testid="test-todo-delete-button"]')
    expect(edit.tagName).toBe('BUTTON')
    expect(del.tagName).toBe('BUTTON')
})

test('card root is an article element', () => {
    const card = document.querySelector('[data-testid="test-todo-card"]')
    expect(card.tagName).toBe('ARTICLE')
})