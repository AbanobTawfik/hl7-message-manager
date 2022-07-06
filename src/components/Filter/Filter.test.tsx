import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Filter from './Filter';

describe('<Filter />', () => {
  test('it should mount', () => {
    render(<Filter />);
    
    const filter = screen.getByTestId('Filter');

    expect(filter).toBeInTheDocument();
  });
});