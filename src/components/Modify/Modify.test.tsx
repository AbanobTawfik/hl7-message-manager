import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Modify from './Modify';

describe('<Modify />', () => {
  test('it should mount', () => {
    render(<Modify />);
    
    const modify = screen.getByTestId('Modify');

    expect(modify).toBeInTheDocument();
  });
});