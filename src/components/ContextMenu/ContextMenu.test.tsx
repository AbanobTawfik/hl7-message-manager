import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ContextMenu from './ContextMenu';

describe('<ContextMenu />', () => {
  test('it should mount', () => {
    render(<ContextMenu />);
    
    const contextMenu = screen.getByTestId('ContextMenu');

    expect(contextMenu).toBeInTheDocument();
  });
});