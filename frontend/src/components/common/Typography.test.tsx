import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Typography } from './Typography';

describe('Typography', () => {
  it('renders text content correctly', () => {
    render(<Typography>Sample Text</Typography>);
    expect(screen.getByText('Sample Text')).toBeInTheDocument();
  });
});
