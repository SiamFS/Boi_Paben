import { motion } from 'framer-motion';
import { BookOpen, Users, ShoppingBag } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Discover Your Next Favorite Read',
    description:
      'Dive into an ever-expanding library of books, curated just for you. With advanced filters and personalized recommendations, finding your perfect story has never been easier.',
  },
  {
    icon: Users,
    title: 'Share Your Voice and Connect',
    description:
      'Write blogs, share reviews, and engage with a passionate community of readers. Whether you\'re looking for advice or sharing your latest find, your voice matters here.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop, Sell, and Simplify',
    description:
      'Seamlessly buy, sell, or advertise books with secure payments, reliable delivery, and intuitive tools that make book trading effortless.',
  },
];

export default function About() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 dark:stroke-gray-700 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="pattern"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50 dark:fill-gray-900">
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#pattern)" />
          </svg>
        </div>

        <div className="relative container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-primary font-semibold mb-4">About Us</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              A Better Way to Connect Through Books
            </h1>            <p className="text-xl text-muted-foreground">
              Welcome to BoiPaben, your one-stop destination for book lovers, sellers, and readers
              to connect, share, and discover!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >          <p className="text-lg text-muted-foreground">
            At BoiPaben, we aim to foster a vibrant community where users can explore a vast
            collection of books, share their thoughts through reviews and blogs, and connect with
            like-minded individuals. Whether you're an avid reader looking for your next favorite
            story or a seller offering great finds, BoiPaben has the tools to make your experience
            seamless and enjoyable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Dev's Words</h2>          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We tried to create a platform by focusing on the student, and connect with other book
            lovers. We value the importance of reading and making it accessible to everyone. For us,
            BoiPaben is not just a platform, it's a community where we can share our love for books
            and reading. Happy reading!
          </p>
          <p className="text-xl font-semibold text-primary mt-8">
            At BoiPaben, every book is an adventure, and every reader is part of the story. Join
            us today!
          </p>
        </motion.div>
      </div>
    </div>
  );
}