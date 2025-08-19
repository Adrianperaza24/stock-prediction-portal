import { useEffect, useState } from 'react'
import axiosInstance from '../../axiosInstance'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const Dashboard = () => {
  const [ticker, setTicker] = useState('')
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [plot, setPlot] = useState()
  const [predPlot, setpredPlot] = useState()
  const [mse, setMSE] = useState()
  const [rmse, setRMSE] = useState()
  const [r2, setR2] = useState()

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axiosInstance.get('/protected-view/')  
      } catch(error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchProtectedData();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try{
      const response = await axiosInstance.post('/predict/', {
        ticker: ticker
      });
      console.log(response.data);
      // Set plots
      const backendRoot = import.meta.env.VITE_BACKEND_ROOT
      const plotUrl = `${backendRoot}${response.data.plot_img}`
      const predplotUrl = `${backendRoot}${response.data.plot_pred_img}`
      setPlot(plotUrl)
      setpredPlot(predplotUrl)
      setMSE(response.data.mse)
      setRMSE(response.data.rmse)
      setR2(response.data.r2)

      if (response.data.error){
        setError(response.data.error)
      }
    }catch(error){
      console.error('There was an error making the request', error)
    }finally{
      setLoading(false)
    }
  }
  return (
    <>
     <div className='container'>
        <div className='row'>
          <div className='col-md-6 mx-auto' >
            <form onSubmit={handleSubmit}>
              <input type="text" className='form-control' placeholder='Enter Stock Ticker' onChange={(e) => setTicker(e.target.value)} required />
              <small> {error && <div className='text-danger'>{error}</div>} </small>
              <button type='submit' className='btn btn-info mt-3'>
                {loading ? <span> <FontAwesomeIcon icon={faSpinner} spin/>Please wait...</span>: 'See Prediction'}
              </button>
            </form>
          </div>

          {/* Print prediction plots */}
          {predPlot && (
          <div className='prediction mt-5'>
            <div className='p-3'>
              {plot && (
                <img src={plot} style={{ maxWidth: '100%'}}/>
              )}
            </div>
            <div className='p-3'>
              {predPlot && (
                <img src={predPlot} style={{ maxWidth: '100%'}}/>
              )}
            </div>
            
            <div className='text-light p-3'>
              <h4>Model Evaluation</h4>
              <p>Mean Squared Error (MSE): {mse}</p>
              <p>Root Mean Squared Error (RMSE): {rmse}</p>
              <p>R-squared (R2): {r2}</p>
            </div>
          </div>
          )}
        </div>
     </div>
    </>
  )
}

export default Dashboard