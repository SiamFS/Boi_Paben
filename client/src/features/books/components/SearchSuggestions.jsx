import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, User, Tag, Clock, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';
import apiClient from '@/lib/api-client';

export default function SearchSuggestions({
  query,
  isVisible = true,
  onSuggestionClick,
  onClose = () => {},
  onSelect, // Alternative prop for navbar usage
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Load recent and trending searches on mount
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));

    // Load trending searches (mock for now - you can implement this in backend)
    setTrendingSearches([
      'Programming Books',
      'Fiction Novels',
      'Science Books',
      'History Books',
      'Art & Design'
    ]);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(`/api/books/suggestions/${query}`, {
          params: { limit: 8 }
        });
        
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);  const handleSuggestionClick = (suggestion) => {
    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newRecent = [suggestion, ...recent.filter(item => item !== suggestion)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Use either onSuggestionClick or onSelect based on what's provided
    if (onSelect) {
      onSelect(suggestion);
    } else if (onSuggestionClick) {
      onSuggestionClick(suggestion);
      navigate(`/search/${encodeURIComponent(suggestion)}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'title':
        return <Book className="h-4 w-4" />;
      case 'author':
        return <User className="h-4 w-4" />;
      case 'category':
        return <Tag className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'title':
        return 'Book';
      case 'author':
        return 'Author';
      case 'category':
        return 'Category';
      default:
        return 'Search';
    }
  };

  const renderSuggestionsContent = () => {
    if (loading) {
      return (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        </div>
      );
    }

    if (suggestions.length > 0) {
      return (
        <div>
          <div className="px-4 py-2 border-b bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggestions
            </span>
          </div>
          {suggestions.map((suggestion) => (
            <motion.button
              key={`${suggestion.type}-${suggestion.text}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: suggestions.indexOf(suggestion) * 0.05 }}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="text-muted-foreground">
                {getIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{suggestion.text}</span>
                  {suggestion.count > 1 && (
                    <span className="text-xs text-muted-foreground">
                      ({suggestion.count} books)
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTypeLabel(suggestion.type)}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No suggestions found</p>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`absolute top-full left-0 right-0 z-50 bg-card border rounded-lg shadow-lg mt-1 max-h-96 overflow-hidden ${className}`}
      >
        <div className="max-h-96 overflow-y-auto">
          {/* Active suggestions based on query */}
          {query && query.trim().length >= 2 && (
            <>
              {renderSuggestionsContent()}
            </>
          )}

          {/* Recent searches when no query */}
          {(!query || query.trim().length < 2) && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent searches
                </span>
              </div>              {recentSearches.map((search) => (
                <button
                  key={`recent-${search}`}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending searches when no query */}
          {(!query || query.trim().length < 2) && trendingSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Trending searches
                </span>
              </div>              {trendingSearches.map((search) => (
                <button
                  key={`trending-${search}`}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No content state */}
          {(!query || query.trim().length < 2) && 
           recentSearches.length === 0 && 
           trendingSearches.length === 0 && (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Start typing to search for books</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

SearchSuggestions.propTypes = {
  query: PropTypes.string.isRequired,
  isVisible: PropTypes.bool,
  onSuggestionClick: PropTypes.func,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  className: PropTypes.string,
};
