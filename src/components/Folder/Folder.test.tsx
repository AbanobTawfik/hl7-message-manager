import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Folder from './Folder';

describe('<Folder />', () => {
  test('it should mount', () => {
    render(<Folder />);
    
    const folder = screen.getByTestId('Folder');

    expect(folder).toBeInTheDocument();
  });
});