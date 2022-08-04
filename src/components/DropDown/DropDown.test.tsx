import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DropDown from './DropDown';

describe('<DropDown />', () => {
  test('it should mount', () => {
    render(<DropDown />);
    
    const dropDown = screen.getByTestId('DropDown');

    expect(dropDown).toBeInTheDocument();
  });
});