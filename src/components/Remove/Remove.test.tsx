import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Remove from './Remove';

describe('<Remove />', () => {
  test('it should mount', () => {
    render(<Remove />);
    
    const remove = screen.getByTestId('Remove');

    expect(remove).toBeInTheDocument();
  });
});