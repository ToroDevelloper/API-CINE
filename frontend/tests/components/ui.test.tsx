import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../app/components/ui/Button';
import { Input } from '../../app/components/ui/Input';
import { Alert } from '../../app/components/ui/Alert';

describe('UI Components', () => {
  it('renders Button correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const btn = screen.getByText('Click Me');
    expect(btn).toBeInTheDocument();
    
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders disabled Button', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByText('Disabled');
    expect(btn).toBeDisabled();
  });

  it('renders Button variants', () => {
    render(<Button variant="danger">Destructive</Button>);
    expect(screen.getByText('Destructive').className).toContain('bg-red'); 
  });

  it('renders Input correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders Alert correctly', () => {
    render(
      <>
        <Alert type="error">Error</Alert>
        <Alert type="success" title="Exito">Success</Alert>
        <Alert type="warning">Warning</Alert>
        <Alert type="info">Info</Alert>
      </>
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Exito')).toBeInTheDocument();
  });

  it('renders Input with error', () => {
    render(<Input placeholder="Error input" error />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input.className).toContain('border-red-500');
  });

  it('renders Input label and custom class', () => {
    render(<Input label="Correo" placeholder="Email" className="custom-input" />);
    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email').className).toContain('custom-input');
  });
});
