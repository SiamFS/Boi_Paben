import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';
import SearchSuggestions from './SearchSuggestions';
import { Button } from '@/components/ui/Button';

export default function SearchBar({ 
  placeholder = "Search books, authors, categories...", 
  size = 'default',
  autoFocus = false,
  onSearch
}) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Extract query from URL if we're on search page
  useEffect(() => {
    if (location.pathname.includes('/search/')) {
      const urlQuery = decodeURIComponent(location.pathname.split('/search/')[1] || '');
      setQuery(urlQuery);
      // Don't show suggestions automatically when loading from URL
      setShowSuggestions(false);
    }
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };
  const handleSearch = (searchQuery) => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Only show suggestions if user is actively typing (not when loading from URL)
    if (isFocused) {
      setShowSuggestions(value.length > 0);
    }
  };
  const handleInputFocus = () => {
    setIsFocused(true);
    // Only show suggestions if user explicitly focuses, not from URL pre-loading
    if (!location.pathname.includes('/search/') || query !== decodeURIComponent(location.pathname.split('/search/')[1] || '')) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    setShowSuggestions(true);
  };
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-10 text-sm';
      case 'large':
        return 'h-14 text-lg';
      default:
        return 'h-12';
    }
  };return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center ${getSizeClasses()}
          bg-background border rounded-full
          shadow-md hover:shadow-lg focus-within:shadow-lg transition-all duration-200
          ${isFocused ? 'ring-2 ring-primary focus:border-primary' : 'border-border'}
        `}>
          <div className="absolute left-4 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
              w-full ${getSizeClasses()} pl-12 pr-24 rounded-full 
              bg-transparent focus:outline-none 
              text-foreground placeholder:text-muted-foreground
              border-none
            `}
          />
          
          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )}
              <Button
              type="submit"
              size="sm"
              className={`${size === 'large' ? 'h-11 px-6' : 'h-9 px-4'} rounded-full shadow-md hover:shadow-lg transition-all duration-200`}
              disabled={!query.trim()}
            >
              Search
            </Button>
          </div>
        </div>

        <SearchSuggestions
          query={query}
          isVisible={showSuggestions}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
        />
      </form>
    </div>
  );
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  autoFocus: PropTypes.bool,
  onSearch: PropTypes.func,
};
