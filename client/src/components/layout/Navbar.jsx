import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  BookOpen, 
  ShoppingCart, 
  Search, 
  LogOut, 
  Camera,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import SearchSuggestions from '@/features/books/components/SearchSuggestions';

export default function Navbar() {  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const { user, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);
  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        await updateUserProfile({ photoURL: data.data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Sell Your Book', path: '/dashboard' },
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isSticky ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-background'
      )}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16">          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <BookOpen className="h-8 w-8" />
            <span>BoiPaben</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="input pr-10 w-64"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                </button>
                {searchQuery && showSuggestions && (
                  <SearchSuggestions
                    query={searchQuery}
                    onSelect={(suggestion) => {
                      navigate(`/search/${suggestion}`);
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute top-full left-0 right-0 z-50 mt-1"
                  />
                )}
              </div>
            </form>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user.photoURL || 'https://i.ibb.co/yWjpDXh/image.png'}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg p-4 animate-slide-down">
                    <div className="text-center mb-4">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Update Photo
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Side menu - slides from right */}
            <div className="fixed top-16 right-0 bottom-0 w-64 bg-card shadow-lg z-41 md:hidden animate-slide-in-right overflow-y-auto">
              <div className="flex flex-col gap-4 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-4 py-2 text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="border-t pt-4">
                  <form onSubmit={handleSearch} className="">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowMobileSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowMobileSuggestions(false), 200)}
                        className="input pr-10 w-full"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      {searchQuery && showMobileSuggestions && (
                        <SearchSuggestions
                          query={searchQuery}
                          onSelect={(suggestion) => {
                            navigate(`/search/${suggestion}`);
                            setSearchQuery('');
                            setIsMenuOpen(false);
                            setShowMobileSuggestions(false);
                          }}
                          className="absolute top-full left-0 right-0 z-50 mt-1"
                        />
                      )}
                    </div>
                  </form>
                </div>

                <div className="border-t pt-4 flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>

                {!user && (
                  <div className="border-t pt-4">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Login</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}