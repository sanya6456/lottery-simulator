import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('toggles value on click', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} id="my-cb" />);
    
    const cb = screen.getByRole('checkbox');
    expect(cb).toBeInTheDocument();
    
    fireEvent.click(cb);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
