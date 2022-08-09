import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Import from './Import';

describe('<Import />', () => {
  test('it should mount', () => {
    render(<Import />);
    
    const import = screen.getByTestId('Import');

    expect(import).toBeInTheDocument();
  });
});