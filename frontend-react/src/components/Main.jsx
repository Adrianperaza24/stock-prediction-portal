import React from 'react'
import Button from './Button'
import Header from './Header'
import Footer from './Footer'

const Main = () => {
  return (
    <>

        <div className='container'>
            <div className='p-5 text-center bg-light-dark rounded'>
                <h1 className='text-light'>Stock Prediction Portal</h1>
                <p className='text-light lead'>This stock prediction application uses ML to forecast future stock prices by analyzing 100-day and 200-day moving averages. The app uses Django Rest Framework for the backend and React for the frontend.</p>
                <Button text='Explore Now' class= 'btn-outline-warning' url='/dashboard'/>
            </div>
        </div>
      <Footer/>
    </>
  )
}

export default Main