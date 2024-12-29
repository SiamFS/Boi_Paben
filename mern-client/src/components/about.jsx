// import React from 'react'

// function about() {
//   return (
//     <div>about</div>
//   )
// }

// export default about

import React from 'react'
import { HiBookOpen } from "react-icons/hi";

const About = () => {
  return (
    <div className='mt-20'>
        <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
        </svg>
      </div>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <p className="text-base font-semibold leading-7 text-orange-400">About Us</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">A better workflow</h1>
              <p className="mt-6 text-xl leading-8 text-gray-700">
              Welcome to CoverBook, your one-stop destination for book lovers, sellers, and readers to connect, share, and discover!
              </p>
            </div>
          </div>
        </div>
        <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <img
            className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
            src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
            alt=""
          />
        </div>
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
              <p>
                At CoverBook, we aim to foster a vibrant community where users can explore a vast collection of books, 
                share their thoughts through reviews and blogs, and connect with like-minded individuals. 
                Whether you're an avid reader looking for your next favorite story or a seller offering great finds, 
                CoverBook has the tools to make your experience seamless and enjoyable.
              </p>
              <ul role="list" className="mt-8 space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <HiBookOpen className="mt-1 h-5 w-5 flex-none text-orange-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">Discover Your Next Favorite Read:</strong> Dive into an ever-expanding library of books, curated just for you. 
                    With advanced filters and personalized recommendations, 
                    finding your perfect story has never been easier.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <HiBookOpen className="mt-1 h-5 w-5 flex-none text-orange-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">Share Your Voice and Connect:</strong> Write blogs, share reviews, 
                    and engage with a passionate community of readers. 
                    Whether you're looking for advice or sharing your latest find, your voice matters here.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <HiBookOpen className="mt-1 h-5 w-5 flex-none text-orange-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-gray-900">Shop, Sell, and Simplify:</strong> Seamlessly buy, sell, 
                    or advertise books with secure payments, reliable delivery, and intuitive tools that make book trading effortless.
                  </span>
                </li>
              </ul>
              <p className="mt-8">
              At CoverBook, every book is an adventure, and every reader is part of the story. Join us today!
              </p>
              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Dev's words...</h2>
              <p className="mt-6">
              We tried to create a platform by focusing the student, and connect with other book lovers. We value the importance of reading and making it accessible to everyone.
              For us, CoverBook is not just a platform, it's a community where we can share our love for books and reading. Happy reading!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default About