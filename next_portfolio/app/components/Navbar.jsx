'use client'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import from next/navigation

const logo = '/assets/images/logo.svg';

const Navbar = () => {
  const pathname = usePathname(); // Get the current pathname

  return (
    <header className='header'>
      <Link href='/' passHref>
        <Image src={logo} alt='logo' width={72} height={72} className='object-contain' />
      </Link>
      <nav className='flex text-lg gap-7 font-medium'>
        <Link href='/about'>
          <p className={pathname === '/about' ? 'text-blue-600' : 'text-white'}>
            About
          </p>
        </Link>
        <Link href='/projects'>
          <p className={pathname === '/projects' ? 'text-blue-600' : 'text-white'}>
            Projects
          </p>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
