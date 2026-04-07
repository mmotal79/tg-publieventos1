import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 p-4 text-white text-center text-sm mt-8">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} T&G Publieventos, c.a. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
