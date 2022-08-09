import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Export from './Export';

describe('<Export />', () => {
  test('it should mount', () => {
    render(<Export />);
    
    const export = screen.getByTestId('Export');

    expect(export).toBeInTheDocument();
  });
});