import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiLogOut, FiMenu, FiUser, FiX, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { storage } from "../api/appwriteConfig";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [profilePicUrl, setProfilePicUrl] = useState(null);

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
    <nav className="fixed top-0 left-0 w-full h-[99px] bg-black flex items-center justify-between md:justify-around md:px-16 z-50 shadow-lg">
      {/* Left Section - Logo Only */}
      <div className="flex gap-5 items-center">
        {/* Logo - Clickable */}
        <Link to="/" onClick={() => setActiveTab("home")}>
          <h1 className="text-white text-[35px] font-semibold cursor-pointer">ShowGo.</h1>
        </Link>
      </div>

      {/* Hamburger Menu - Visible on Small Screens */}
      <div className="relative right-5 md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Navigation Links (Desktop) */}
      <ul className="hidden md:flex justify-between w-[265.8px] text-lg">
        {["home", "events", "about"].map((tab) => (
          <li key={tab} className="w-[87px] flex justify-center">
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

      {/* Right Section - User Avatar or Get Started (Desktop) */}
      <div className="flex items-center">
        {isLoggedIn ? (
          <div className="relative">
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
          <Link to="/login-signup" className="hidden md:flex">
            <button className="bg-white text-black w-[149.26px] h-[40px] rounded-full font-semibold shadow-lg hover:opacity-80 flex items-center justify-center cursor-pointer">
              <span className="w-[112px] text-center">Get Started</span>
            </button>
          </Link>
        )}
      </div>

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

          {/* Get Started Button (Mobile) - Only shown when not logged in */}
          {!isLoggedIn && (
            <Link to="/login-signup">
              <button className="bg-white text-black w-[149.26px] h-[40px] rounded-full font-semibold shadow-lg hover:opacity-80">
                Get Started
              </button>
            </Link>
          )}

          {/* User Avatar (Mobile) - Only shown when logged in */}
          {isLoggedIn && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.profilePicUrl || "https://via.placeholder.com/150"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-[1.5px] border-white"
                />
                <span className="text-white font-medium">My Account</span>
              </div>
              <Link to="/profile" className="w-full">
                <button className="w-full flex items-center justify-center gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300">
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">View Profile</span>
                </button>
              </Link>
              <button
                onClick={logoutHandler}
                className="w-full flex items-center justify-center gap-3 text-base text-white rounded-lg py-3 px-4 hover:bg-white hover:text-black transition-all duration-300"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;