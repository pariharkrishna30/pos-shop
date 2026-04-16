import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import LoginForm from '../../pages/LoginPage'

describe('LoginForm', () => {

  test('renders email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  test('shows error when submitted empty', async () => {
    render(<LoginForm />)

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  test('calls onSubmit with email and password', async () => {
    const mockSubmit = vi.fn()
    render(<LoginForm onSubmit={mockSubmit} />)

    await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      })
    })
  })

})