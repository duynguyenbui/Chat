import React from 'react';
import MainNav from './main-nav';
import UserButton from './user-button';

const Header = () => {
  return (
    <header className="sticky flex justify-center border-b shadow-md">
      <div className="flex items-center justify-between w-full h-16 max-w-6xl px-4 sm:px-6">
        <MainNav />
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
