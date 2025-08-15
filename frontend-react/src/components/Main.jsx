import React from 'react'
import Button from './Button'

const Main = () => {
  return (
    <>
        <div className='container'>
            <div className='p-5 text-center bg-light-dark rounded'>
                <h1 className='text-light'>Stock Prediction Portal</h1>
                <p className='text-light lead'>This stock prediction application uses ML to forecast future stock prices by analyzing 100-day and 200-day moving averages. The app uses Django Rest Framework for the backend and React for the frontend.</p>
                <Button text='Login' class= 'btn-outline-warning'/>
            </div>
        </div>
    </>
  )
}

export default Main