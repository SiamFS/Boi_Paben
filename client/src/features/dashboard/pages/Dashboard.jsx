import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { bookService } from '@/features/books/services/bookService';
import { formatCurrency } from '@/lib/utils';
import { StatsLoadingSkeleton, TableLoadingSkeleton } from '@/components/ui/LoadingComponents';
import ServerErrorHandler from '@/components/ui/ServerErrorHandler';

export default function Dashboard() {
  const { user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);

  const { data: books = [], isLoading, error, refetch } = useQuery({
    queryKey: ['userBooks', user?.email],
    queryFn: () => bookService.getUserBooks(user.email),
    enabled: !!user?.email,
    retry: (failureCount, error) => {
      if (error?.code === 'NETWORK_ERROR' || error?.status >= 500) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
        <ServerErrorHandler 
          error={error} 
          onRetry={handleRetry}
          retryCount={retryCount}
        />
      </div>
    );
  }

  const soldBooks = books.filter((book) => book.availability === 'sold');
  const totalRevenue = soldBooks.reduce((sum, book) => sum + parseFloat(book.Price), 0);
  const averagePrice = soldBooks.length > 0 ? totalRevenue / soldBooks.length : 0;

  const stats = [
    {
      label: 'Total Books Sold',
      value: soldBooks.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Average Price',
      value: formatCurrency(averagePrice),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      {isLoading ? (
        <>
          <StatsLoadingSkeleton count={3} />
          <div className="mt-12">
            <div className="card">
              <div className="p-6 border-b">
                <div className="h-6 bg-muted skeleton rounded w-32" />
              </div>
              <TableLoadingSkeleton columns={5} rows={3} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Sold Books</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Image</th>
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Author</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {soldBooks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No books sold yet
                      </td>
                    </tr>
                  ) : (
                    soldBooks.map((book) => (
                      <tr key={book._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <img
                            src={book.imageURL}
                            alt={book.bookTitle}
                            className="h-16 w-12 object-cover rounded"
                          />
                        </td>
                        <td className="p-4">{book.bookTitle}</td>
                        <td className="p-4">{book.authorName}</td>
                        <td className="p-4">{book.category}</td>
                        <td className="p-4">{formatCurrency(book.Price)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}