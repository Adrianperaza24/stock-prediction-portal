from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializer
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import os
from django.conf import settings
from .utils import save_plot
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score

class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializer(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']

            # Fetch data from yfinance
            now = datetime.now()
            start = datetime(now.year - 10, now.month, now.day)
            end = now
            df = yf.download(ticker, start, end)
            if df.empty:
                return Response({
                    'error': 'No data found for the given ticker.', 
                    'status': status.HTTP_404_NOT_FOUND
                })
            df = df.reset_index()
            ma100 = df.Close.rolling(100).mean()
            ma200 = df.Close.rolling(200).mean()
            # Generate basic plot
            plt.switch_backend('AGG')
            plt.figure(figsize=(12,5))
            plt.plot(df.Close, 'b', label='Closing Price')
            plt.plot(ma100, 'r', label='100 Days Moving Average')
            plt.plot(ma200, 'g', label='200 Days Moving Average')
            plt.title(f'Closing price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Close price')
            plt.legend()
            # Save plot to file
            plot_img_path = f'{ticker}_plot.png'
            plot_img = save_plot(plot_img_path)

            # Split data into Training and testing
            data_training = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
            data_testing = pd.DataFrame(df.Close[int(len(df)*0.7):int(len(df))])

            scaler = MinMaxScaler(feature_range=(0,1))

            # Load Keras Model
            model = load_model('stock_prediction_model.keras')

            # Prepare test data
            past_100_days = data_training.tail(100)
            final_test_df = pd.concat([past_100_days, data_testing], ignore_index=True)
            input_data = scaler.fit_transform(final_test_df)
            x_test = []
            y_test = []

            for i in range(100, input_data.shape[0]):
                x_test.append(input_data[i-100: i])
                y_test.append(input_data[i, 0])

            x_test, y_test = np.array(x_test), np.array(y_test)

            # Make predictions
            y_predicted = model.predict(x_test)

            # Revert the scaled price to original price
            y_predicted = scaler.inverse_transform(y_predicted.reshape(-1,1)).flatten()
            y_test = scaler.inverse_transform(y_test.reshape(-1,1)).flatten()

            # Plot final prediction
            plt.switch_backend('AGG')
            plt.figure(figsize=(12,5))
            plt.plot(y_test, 'b', label='Original Price')
            plt.plot(y_predicted, 'r', label='Predicted Price')
            plt.title('Original vs Predicted')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_img_path = f'{ticker}_predicted.png'
            plot_pred_img = save_plot(plot_img_path)

            # Model Eval
            mse = mean_squared_error(y_test, y_predicted)
            print('--------------------------')
            print(f'Mean Squared Error: {mse}')
            print('--------------------------')

            rmse = np.sqrt(mse)
            print('--------------------------')
            print(f'Root Mean Squared Error: {rmse}')
            print('--------------------------')

            r2 = r2_score(y_test, y_predicted)
            print('--------------------------')
            print(f'R-Squared: {r2}')
            print('--------------------------')

            return Response({
                'status': 'success',
                'plot_img': plot_img,
                'plot_pred_img': plot_pred_img,
                'mse': mse,
                'rmse': rmse,
                'r2': r2
                })

