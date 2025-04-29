import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="w-full min-h-[400px] bg-black flex flex-col items-center justify-center">
      <footer className="w-full text-white">
        <div className="container mx-auto flex flex-wrap justify-center items-start gap-8 pt-10 px-6 md:px-12 lg:px-16">
          {/* Contact Section */}
          <div className="flex flex-col gap-3 w-full sm:w-[45%] md:w-[30%] lg:w-[20%] min-w-[160px] text-center sm:text-left">
            <Link
              to="/contact"
              className="text-lg font-semibold hover:underline"
              onClick={() => window.scrollTo(0, 0)}
            >
              Contact Us
            </Link>
            <p className="flex items-center gap-2 justify-center sm:justify-start">
              📧{" "}
              <a href="mailto:info@musicfest.com" className="hover:underline">
                info@musicfest.com
              </a>
            </p>
            <p className="flex items-center gap-2 justify-center sm:justify-start">
              📞{" "}
              <a href="tel:+15551234567" className="hover:underline">
                +1 (555) 123-4567
              </a>
            </p>
            <p className="flex items-center gap-2 justify-center sm:justify-start">
              📍 Central Park, New York
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="flex flex-col gap-2 w-full sm:w-[45%] md:w-[30%] lg:w-[16%] min-w-[160px] text-center sm:text-left">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <a href="/join-community" className="hover:underline">
              Join Community
            </a>
            <a href="/about" className="hover:underline">
              About Us
            </a>
            <a href="#" className="hover:underline">
              FAQ
            </a>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <Link
              to="/privacy-policy"
              className="hover:underline"
              onClick={() => window.scrollTo(0, 0)}
            >
              Privacy Policy
            </Link>
          </div>

          {/* Account Section */}
          <div className="flex flex-col gap-2 w-full sm:w-[45%] md:w-[30%] lg:w-[10%] min-w-[160px] text-center sm:text-left">
            <h3 className="text-lg font-semibold">Account</h3>
            <Link
              to="/account-delete"
              className="hover:underline"
              onClick={() => window.scrollTo(0, 0)}
            >
              Request Account Deletion
            </Link>
          </div>

          {/* Follow Us Section */}
          <div className="flex flex-col gap-2 w-full sm:w-[45%] md:w-[30%] lg:w-[16%] min-w-[160px] text-center">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-3 justify-center">
              <FaFacebookF className="cursor-pointer hover:text-gray-400" />
              <FaTwitter className="cursor-pointer hover:text-gray-400" />
              <FaInstagram className="cursor-pointer hover:text-gray-400" />
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col gap-4 w-full sm:w-[45%] md:w-[60%] lg:w-[20%] text-center sm:text-left">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p>Stay updated with our latest events</p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#27272A] text-white rounded-lg outline-none w-full px-4 py-2"
              />
              <button className="bg-white text-black rounded-lg cursor-pointer text-sm px-6 py-3 font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="container mx-auto flex justify-center items-center text-center pt-10 px-6 md:px-12 lg:px-16">
          © 2025 ShowGo. All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default Footer;