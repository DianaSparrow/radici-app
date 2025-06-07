import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Check, Clock, Circle, ArrowLeft, Users, FileText, Trash2 } from 'lucide-react';
import { documentDisplayNames, documentHelpText, validateImageFile } from '../utils/documentHelpers';

const DocumentsView = ({
  user,
  familyMembers,
  documents,
  setCurrentView,
  updateDocumentStatus,
  handleImageUpload,
  removeDocumentImage
}) => {
  const [selectedPerson, setSelectedPerson] = useState(familyMembers[0]?.id || null);
  const [showUpload, setShowUpload] = useState(null);

  useEffect(() => {
    if (!selectedPerson && familyMembers.length > 0) {
      setSelectedPerson(familyMembers[0].id);
    }
  }, [familyMembers, selectedPerson]);

  const handleCameraCapture = useCallback((docId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      if (e.target.files[0]) {
        const validation = validateImageFile(e.target.files[0]);
        if (validation.valid) {
          const success = handleImageUpload(docId, e.target.files[0]);
          if (success) {
            setShowUpload(null);
          }
        } else {
          alert(validation.error);
        }
      }
    };
    input.click();
  }, [handleImageUpload]);

  const handleFileUpload = useCallback((docId, file) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      const success = handleImageUpload(docId, file);
      if (success) {
        setShowUpload(null);
      }
    } else {
      alert(validation.error);
    }
  }, [handleImageUpload]);

  const selectedPersonDocs = documents.filter(doc => doc.familyMemberId === selectedPerson);
  const selectedPersonInfo = familyMembers.find(p => p.id === selectedPerson);

  if (familyMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg p-8 shadow-sm">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No family members found</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-white mb-2 flex items-center hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-xl font-bold">Document Management</h1>
        <p className="text-sm opacity-90">Upload and track your citizenship documents</p>
      </div>

      <div className="p-6">
        {/* Person Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Family Member</label>
          <select
            value={selectedPerson || ''}
            onChange={(e) => setSelectedPerson(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white shadow-sm"
          >
            {familyMembers.map(person => (
              <option key={person.id} value={person.id}>
                {person.name || person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1)}
                {person.isPrimary && ' (You)'}
                {person.isAncestor && ' 🇮🇹'}
              </option>
            ))}
          </select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Documents for {selectedPersonInfo?.name || selectedPersonInfo?.relationship}
            </h3>
            {selectedPersonDocs.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {selectedPersonDocs.filter(doc => doc.status === 'complete').length}/{selectedPersonDocs.length} Complete
              </span>
            )}
          </div>
          
          {selectedPersonDocs.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents found for this family member.</p>
            </div>
          ) : (
            selectedPersonDocs.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {documentDisplayNames[doc.documentType]}
                    </h4>
                    <select
                      value={doc.status}
                      onChange={(e) => updateDocumentStatus(doc.id, e.target.value, doc.notes)}
                      className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-yellow-500 bg-white"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    doc.status === 'complete' ? 'bg-green-100 text-green-800' :
                    doc.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status === 'complete' && <Check size={12} />}
                    {doc.status === 'in_progress' && <Clock size={12} />}
                    {doc.status === 'not_started' && <Circle size={12} />}
                    {doc.status === 'complete' ? 'Complete' :
                     doc.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </div>
                </div>

                {/* Document Image/Upload Area */}
                <div className="mt-4">
                  {doc.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={doc.imageUrl} 
                        alt={documentDisplayNames[doc.documentType]}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setShowUpload(doc.id)}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1 transition-colors"
                        >
                          <Upload size={16} />
                          Replace
                        </button>
                        <button
                          onClick={() => removeDocumentImage(doc.id)}
                          className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-4">Add a photo of this document</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleCameraCapture(doc.id)}
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Camera size={16} />
                          Take Photo
                        </button>
                        <button
                          onClick={() => setShowUpload(doc.id)}
                          className="w-full bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Upload size={16} />
                          Upload Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Modal */}
                {showUpload === doc.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleFileUpload(doc.id, e.target.files[0]);
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        Accepted formats: JPEG, PNG, GIF, WebP (max 10MB)
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowUpload(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCameraCapture(doc.id)}
                          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1 transition-colors"
                        >
                          <Camera size={16} />
                          Camera
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {doc.status !== 'not_started' && (
                  <div className="mt-3">
                    <textarea
                      placeholder="Add notes about this document..."
                      value={doc.notes}
                      onChange={(e) => updateDocumentStatus(doc.id, doc.status, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 transition-colors"
                      rows="2"
                    />
                  </div>
                )}

                {/* Help Text */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>How to get this document:</strong> {documentHelpText[doc.documentType]}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Summary */}
        {selectedPersonDocs.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Progress Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {selectedPersonDocs.filter(doc => doc.status === 'complete').length}
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {selectedPersonDocs.filter(doc => doc.status === 'in_progress').length}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {selectedPersonDocs.filter(doc => doc.status === 'not_started').length}
                </div>
                <div className="text-xs text-gray-600">Not Started</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
