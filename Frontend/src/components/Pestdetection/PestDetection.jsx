import { useState } from 'react';
import axios from 'axios';

const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setPrediction(null); // Clear previous prediction
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      // Append the image file with the correct field name 'file'
      formData.append('file', selectedImage);

      const response = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'  // This is crucial for file uploads
        }
      });

      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl mt-10 font-bold text-green-800 mb-2">Crop Disease Predictor</h1>
          <p className="text-green-600">Upload an image of your crop to detect potential diseases</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Upload Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              {previewImage ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-dashed border-green-300">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Upload a crop image</p>
                  </div>
                </div>
              )}

              <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                <span>{previewImage ? 'Change Image' : 'Select Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Prediction Section */}
          <div className="p-6">
            <button
              onClick={handlePredict}
              disabled={isLoading || !selectedImage}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isLoading || !selectedImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition duration-200`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Predict Disease'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {prediction && (
              <div className="prediction-results">
                <h3>Detection Results</h3>
                <p><strong>Crop Type:</strong> {prediction.leaf_name || 'Unknown'}</p>
                <p><strong>Disease Detected:</strong> {prediction.status || 'Unknown'}</p>
                <p><strong>Confidence:</strong> {prediction.confidence || 'N/A'}</p>

                {prediction.cause && (
                  <div className="disease-details">
                    <h4>Disease Details</h4>
                    <p><strong>Cause:</strong> {prediction.cause}</p>
                    <p><strong>Treatment:</strong> {prediction.treatment}</p>
                    <p><strong>Prevention:</strong> {prediction.prevention}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Our AI model has been trained on thousands of crop images for accurate disease detection.</p>
        </div>
      </div>
    </div>
  );
};

export default PestDetection;