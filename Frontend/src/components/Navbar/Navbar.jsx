import { useEffect, useState } from "react";
import { useUser, SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Leaf, Users, MessageSquare, Contact, BarChart2, Bug } from "lucide-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn && location.pathname === "/") {
      navigate("/forcusting");
    }
  }, [isSignedIn, navigate, location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href) => {
    if (location.pathname === "/") {
      if (href === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const sectionId = href.substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
    setMobileMenuOpen(false);
  };

  const publicNavLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5 text-green-500" /> },
    { name: "Services", href: "/services", icon: <Leaf className="w-5 h-5 text-green-500" /> },
    { name: "About", href: "/about", icon: <Users className="w-5 h-5 text-green-500" /> },
    { name: "Testimonial", href: "/testimonial", icon: <MessageSquare className="w-5 h-5 text-green-500" /> },
    { name: "Contact", href: "/contact", icon: <Contact className="w-5 h-5 text-green-500" /> },
  ];

  const privateNavLinks = [
    { name: "Smartintegration", href: "/smartintegration", icon: <Home className="w-5 h-5 text-green-500" /> },
    { name: "Weather & Soil", href: "/weathersoildata", icon: <BarChart2 className="w-5 h-5 text-green-500" /> },
    { name: "Crop Recomendation", href: "/croprecommendation", icon: <Leaf className="w-5 h-5 text-green-500" /> },
    { name: "Pest Detection", href: "/pestdetection", icon: <Bug className="w-5 h-5 text-green-500" /> },
  ];

  const navLinks = isSignedIn ? privateNavLinks : publicNavLinks;

  return (
    <>
      <motion.nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-white/90 backdrop-blur-sm py-3"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Link 
              to={isSignedIn ? "/forcusting" : "/"}
              onClick={() => handleNavClick("/")}
              className="flex items-center"
            >
              <img src="/logo.png" alt="Logo" className="h-8" />
              <span className="ml-2 text-xl font-bold text-green-600 hidden sm:block">Krishii Mitra</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link 
                  to={link.href}
                  onClick={(e) => {
                    if (location.pathname === "/") {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-4/5"></span>
                </Link>
              </motion.div>
            ))}

            <SignedOut>
              <SignInButton mode="modal" asChild>
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg ml-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Get Started
                </motion.button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <motion.div
                className="flex items-center gap-4 ml-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  Hi, {user?.firstName || "User"}
                </span>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9 border-2 border-green-100",
                    }
                  }}
                />
              </motion.div>
            </SignedIn>
          </div>

          <button 
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-20 px-6 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={index}
                  className="text-lg font-medium text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.icon}
                  <Link to={link.href} className="w-full">
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-gray-200 mt-2">
                <SignedOut>
                  <SignInButton mode="modal" asChild>
                    <motion.button
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold text-lg mt-2"
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Get Started
                    </motion.button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <motion.div
                    className="flex items-center gap-4 py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "w-10 h-10 border-2 border-green-100",
                        }
                      }}
                    />
                    <span className="font-medium">
                      {user?.firstName || "User"}
                    </span>
                  </motion.div>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;