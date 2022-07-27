import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Back from './Back';

describe('<Back />', () => {
  test('it should mount', () => {
    render(<Back />);
    
    const back = screen.getByTestId('Back');

    expect(back).toBeInTheDocument();
  });
});