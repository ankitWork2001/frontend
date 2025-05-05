import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiUser, FiX, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { storage } from "../api/appwriteConfig";

const Navbar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    
    // Exact matches first
    if (path === "/") {
      setActiveTab("home");
      return;
    }
    
    // Then partial matches
    const tabs = ["events", "about", "profile", "admin"];
    const currentTab = tabs.find(tab => path.startsWith(`/${tab}`));
    
    if (currentTab) {
      setActiveTab(currentTab);
    } else {
      setActiveTab(null); // or keep previous value
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user?.profilePicUrl) {
      const getImageUrl = async () => {
        try {
          const fileUrl = storage.getFilePreview("user_profile_pics", user.profilePicUrl).href;
          setProfilePicUrl(fileUrl);
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      };
      getImageUrl();
    }
  }, [user]);

  const logoutHandler = () => {
    logout();
    setShowPopover(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-[99px] bg-black flex items-center justify-between px-4 md:px-16 z-50 shadow-lg">
      {/* Left Section - Logo and User Icon (Mobile only when logged in) */}
      <div className="flex items-center gap-4">
        {/* User Icon (Mobile - only when logged in) */}
        {isLoggedIn && (
          <div className="md:hidden">
            <img
              src={user?.profilePicUrl || "https://via.placeholder.com/150"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer border-[1.5px] border-white hover:scale-105 transition-transform duration-300"
              onClick={() => setShowPopover(!showPopover)}
            />
            {showPopover && (
              <div className="absolute top-20 left-4 bg-black text-white rounded-lg shadow-md w-56 py-5 px-6 z-[1000] space-y-4">
                <Link to="/profile">
                  <button className="w-full flex items-center justify-start gap-3 text-base text-white outline-white/40 rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300">
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">View Profile</span>
                  </button>
                </Link>

                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <button className="w-full flex items-center justify-start gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300">
                      <FiSettings className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center justify-start gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Logo */}
        <Link to="/" onClick={() => setActiveTab("home")} className="flex-shrink-0">
          <h1 className="text-white text-[35px] font-semibold cursor-pointer">ShowGo.</h1>
        </Link>
      </div>

      {/* Middle Section - Navigation Links (Desktop) */}
      <ul className="hidden md:flex justify-center flex-1 max-w-md mx-8 text-lg">
        {["home", "events", "about"].map((tab) => (
          <li key={tab} className="mx-2">
            <Link
              to={`/${tab === "home" ? "" : tab}`}
              onClick={() => setActiveTab(tab)}
            >
              <button
                className={`w-[87px] h-[40px] rounded-full text-lg font-semibold flex items-center justify-center cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-black"
                    : "text-white bg-transparent"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </Link>
          </li>
        ))}
      </ul>

      {/* Right Section - Hamburger Menu (Mobile) / Auth Buttons (Desktop) */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu (Mobile) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-white text-3xl"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop Auth Buttons */}
        {isLoggedIn ? (
          <div className="hidden md:block relative">
            <img
              src={user?.profilePicUrl || "https://via.placeholder.com/150"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer border-[1.5px] border-white hover:scale-105 transition-transform duration-300"
              onClick={() => setShowPopover(!showPopover)}
            />
            {showPopover && (
              <div className="absolute top-14 right-0 bg-black text-white rounded-lg shadow-md w-56 py-5 px-6 z-[1000] space-y-4">
                <Link to="/profile">
                  <button className="w-full flex items-center justify-start gap-3 text-base text-white outline-white/40 rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300">
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">View Profile</span>
                  </button>
                </Link>

                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <button className="w-full flex items-center justify-start gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300">
                      <FiSettings className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center justify-start gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login-signup" className="hidden md:block">
            <button className="bg-white text-black w-[149.26px] h-[40px] rounded-full font-semibold shadow-lg hover:opacity-80 flex items-center justify-center cursor-pointer">
              <span className="w-[112px] text-center">Get Started</span>
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Menu (Only Visible When Open) */}
      {/* Mobile Menu (Only Visible When Open) */}
{isOpen && (
  <div className="absolute top-[99px] left-0 w-full bg-black flex flex-col items-center gap-6 py-6 md:hidden">
    {["home", "events", "about"].map((tab) => (
      <Link
        key={tab}
        to={`/${tab === "home" ? "" : tab}`}
        onClick={() => {
          setActiveTab(tab);
          setIsOpen(false);
        }}
      >
        <button
          className={`w-[120px] h-[40px] rounded-full text-lg font-semibold flex items-center justify-center cursor-pointer ${
            activeTab === tab
              ? "bg-white text-black"
              : "text-white bg-transparent"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      </Link>
    ))}

    {/* Show Get Started in mobile menu only when logged out */}
    {!isLoggedIn && (
      <Link to="/login-signup">
        <button 
          onClick={() => setIsOpen(false)}  // Added this onClick handler
          className="bg-white text-black w-[149.26px] h-[40px] rounded-full font-semibold shadow-lg hover:opacity-80"
        >
          Get Started
        </button>
      </Link>
    )}
  </div>
)}
    </nav>
  );
};

export default Navbar;