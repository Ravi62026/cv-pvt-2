import React from 'react';
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  File,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';

const FileMessage = ({ fileData, isOwn, timestamp, sender }) => {
  // Debug: Log file data to see what we have
  console.log('📄 FileMessage rendered with data:', fileData);

  // Add click debugging
  const handleCardClick = (e) => {
    console.log('🖱️ File card clicked!', e);
    console.log('📄 File data:', fileData);
    handlePreview(e);
  };
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-6 w-6" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('word')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileUrl = () => {
    // Always use the original Pinata URL - no more masking!
    console.log('� Using original Pinata URL:', fileData.url);
    return fileData.url;
  };

  const handleDownload = (e) => {
    e.stopPropagation(); // Prevent card click
    console.log('🔽 File download clicked:', fileData);
    const url = getFileUrl();
    console.log('🔗 Download URL:', url);
    console.log('🌐 Opening URL in new tab for download...');

    // Simply open in new tab - browser will handle download
    window.open(url, '_blank');
  };

  const handlePreview = (e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling if called from button
    console.log('👁️ File preview clicked:', fileData);
    const url = getFileUrl();
    console.log('🔗 Preview URL:', url);
    console.log('🌐 Opening URL in new tab...');

    // Always open in new tab regardless of file type
    window.open(url, '_blank');
  };

  const isImage = fileData.mimeType.startsWith('image/');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        {/* Sender name for received messages */}
        {!isOwn && sender && (
          <div className="text-xs text-gray-300 mb-1 px-1">
            {sender.name}
          </div>
        )}

        <div
          className={`rounded-2xl p-3 cursor-pointer hover:shadow-xl transition-all duration-200 backdrop-blur-sm ${
            isOwn
              ? 'bg-gradient-to-r from-green-600/90 to-green-700/90 text-white border border-green-500/40 hover:from-green-500/90 hover:to-green-600/90 message-bubble-shadow-own'
              : 'bg-white/15 text-white border border-white/25 hover:border-white/40 hover:bg-white/20 message-bubble-shadow'
          }`}
          onClick={handleCardClick}
          title="Click to open file"
          style={{ userSelect: 'none' }}
        >
          {/* Image Preview */}
          {isImage ? (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={getFileUrl()}
                  alt={fileData.originalName}
                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handlePreview}
                  style={{ maxHeight: '200px' }}
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={handlePreview}
                    className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    title="View full size"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className={`text-xs ${isOwn ? 'text-green-100/80' : 'text-gray-300/80'}`}>
                {fileData.originalName} • {formatFileSize(fileData.size)}
              </div>
            </div>
          ) : (
            /* File Document */
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isOwn ? 'bg-green-500/30' : 'bg-white/20'}`}>
                {getFileIcon(fileData.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm truncate ${isOwn ? 'text-white' : 'text-white'}`}>
                  {fileData.originalName}
                </div>
                <div className={`text-xs ${isOwn ? 'text-green-100/80' : 'text-gray-300/80'}`}>
                  {formatFileSize(fileData.size)} • 📎 Click to open
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('👁️ Preview button clicked!');
                    handlePreview(e);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    isOwn
                      ? 'hover:bg-green-500/30 text-green-100'
                      : 'hover:bg-white/20 text-gray-300'
                  }`}
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('⬇️ Download button clicked!');
                    handleDownload(e);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    isOwn
                      ? 'hover:bg-green-500/30 text-green-100'
                      : 'hover:bg-white/20 text-gray-300'
                  }`}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs mt-1.5 px-1 ${isOwn ? 'text-right text-green-100/80' : 'text-left text-gray-300/80'}`}>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default FileMessage;
