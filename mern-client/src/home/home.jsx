import React from 'react'
import Banner from '../components/Banner'
import CategoryBooks from './CategoryBooks'
import LatestBooks from './LatestBooks'



const Home = () => {
  return (
    <div>
      <Banner />
      <CategoryBooks />
      <LatestBooks />
      
    </div>
  )
}

export default Home