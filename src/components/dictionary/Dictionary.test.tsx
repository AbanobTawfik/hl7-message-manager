import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dictionary from './Dictionary';

describe('<Dictionary />', () => {
  test('it should mount', () => {
    render(<Dictionary />);
    
    const dictionary = screen.getByTestId('Dictionary');

    expect(dictionary).toBeInTheDocument();
  });
});