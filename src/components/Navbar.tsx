import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {

  return (
    <nav className="font-semibold p-4 flex justify-between items-center">
      
      <div className="flex items-center">
        {/* <img
            src="/images/CalOne-logo.png"
            alt="CalOne"
            style={{ maxWidth: '1000px', maxHeight: '40px' }}
        /> */}
        <Link href="/" className="mr-10">
          Home
        </Link>
        <Link href="/about" className="mr-10">
          About
        </Link>
        <Link href="/contact" className="mr-10">
          Contact
        </Link>
        
      </div>
    </nav>
  )
};

export default Navbar;
