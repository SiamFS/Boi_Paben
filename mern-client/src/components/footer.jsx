import React from 'react';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsDribbble } from 'react-icons/bs';

const ModernFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">About</h2>
            <ul>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Our Company</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Our Team</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Services</h2>
            <ul>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Web Design</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Development</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Legal</h2>
            <ul>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">&copy; 2024 Boi Paben. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <BsFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <BsInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <BsTwitter size={20} />
              </a>
              <a href="https://github.com/SiamFS/Boi_Paben_CSE470_Project.git" className="text-gray-400 hover:text-white transition-colors duration-300">
                <BsGithub size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;