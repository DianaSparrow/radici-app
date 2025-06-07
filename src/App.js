import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, Upload, Check, Clock, Circle, ArrowLeft, Users, FileText, Settings, Home, Trash2, Plus, Minus } from 'lucide-react';

const RadiciApp = () => {
  const [currentView, setCurrentView] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data from memory on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('radici_user');
    const savedFamily = localStorage.getItem('radici_family');
    const savedDocs = localStorage.getItem('radici_documents');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
    if (savedFamily) setFamilyMembers(JSON.parse(savedFamily));
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
  }, []);

  // Memoized document requirements by relationship
  const getDocumentsForPerson = useCallback((person) => {
    const baseDocuments = ['birth_certificate', 'photo_id'];
    
    if (person.relationship === 'spouse' || person.relationship === 'self') {
      baseDocuments.push('marriage_certificate');
    }
    
    if (person.relationship === 'self') {
      baseDocuments.push('italian_ancestor_birth', 'naturalization_records');
    }
    
    return baseDocuments;
  }, []);

  const documentDisplayNames = {
    birth_certificate: 'Birth Certificate',
    marriage_certificate: 'Marriage Certificate', 
    photo_id: 'Photo ID/Passport',
    italian_ancestor_birth: 'Italian Ancestor Birth Certificate',
    naturalization_records: 'Naturalization Records'
  };

  const documentHelpText = {
    birth_certificate: 'Usually obtained from state vital records office',
    marriage_certificate: 'Usually obtained from county clerk or vital records',
    photo_id: 'Driver\'s license, state ID, or passport',
    italian_ancestor_birth: 'Request from Italian municipality (comune)',
    naturalization_records: 'USCIS FOIA request or court records'
  };

  // Enhanced data persistence
  const saveData = useCallback((userData, familyData, documentsData) => {
    try {
      if (userData !== null) localStorage.setItem('radici_user', JSON.stringify(userData));
      if (familyData !== null) localStorage.setItem('radici_family', JSON.stringify(familyData));
      if (documentsData !== null) localStorage.setItem('radici_documents', JSON.stringify(documentsData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  // Progress calculation with memoization
  const progressStats = useMemo(() => {
    const totalDocs = documents.length;
    const completedDocs = documents.filter(doc => doc.status === 'complete').length;
    const inProgressDocs = documents.filter(doc => doc.status === 'in_progress').length;
    const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
    
    return { totalDocs, completedDocs, inProgressDocs, progressPercent };
  }, [documents]);

  const OnboardingView = () => {
    const [formData, setFormData] = useState({
      name: '',
      ancestorName: '',
      ancestorType: 'grandparent',
      includeFamily: [],
      familyCounts: {
        spouse: 1,
        children: 1,
        siblings: 1,
        cousins: 1
      }
    });
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.ancestorName.trim()) newErrors.ancestorName = 'Ancestor name is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      setLoading(true);
      
      try {
        const userData = {
          name: formData.name.trim(),
          ancestorName: formData.ancestorName.trim(),
          ancestorType: formData.ancestorType,
          createdAt: new Date().toISOString()
        };

        const family = [{
          id: 1,
          name: formData.name.trim(),
          relationship: 'self',
          birthYear: '',
          birthState: '',
          isPrimary: true
        }];

        let nextId = 2;
        
        // Generate family members based on selections
        formData.includeFamily.forEach(familyType => {
          const count = formData.familyCounts[familyType];
          for (let i = 0; i < count; i++) {
            family.push({
              id: nextId++,
              name: '',
              relationship: familyType === 'children' ? 'child' : 
                          familyType === 'siblings' ? 'sibling' :
                          familyType === 'cousins' ? 'cousin' : familyType,
              birthYear: '',
              birthState: '',
              isPrimary: false
            });
          }
        });

        // Generate required documents for each family member
        const allDocs = [];
        family.forEach(person => {
          const docTypes = getDocumentsForPerson(person);
          docTypes.forEach(docType => {
            allDocs.push({
              id: `${person.id}-${docType}`,
              familyMemberId: person.id,
              documentType: docType,
              status: 'not_started',
              imageUrl: null,
              notes: '',
              createdAt: new Date().toISOString()
            });
          });
        });

        setUser(userData);
        setFamilyMembers(family);
        setDocuments(allDocs);
        saveData(userData, family, allDocs);
        setCurrentView('dashboard');
      } catch (error) {
        console.error('Error during onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    const updateFamilyCount = (type, count) => {
      setFormData(prev => ({
        ...prev,
        familyCounts: {
          ...prev.familyCounts,
          [type]: Math.max(1, Math.min(10, count))
        }
      }));
    };

    const toggleFamilyMember = (type) => {
      setFormData(prev => ({
        ...prev,
        includeFamily: prev.includeFamily.includes(type)
          ? prev.includeFamily.filter(f => f !== type)
          : [...prev.includeFamily, type]
      }));
    };

    if (step === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-6">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Radici</h1>
              <p className="text-gray-600">Your journey to Italian citizenship starts here</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full legal name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Italian-born Ancestor</label>
                <input
                  type="text"
                  value={formData.ancestorName}
                  onChange={(e) => setFormData(prev => ({...prev, ancestorName: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.ancestorName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Giuseppe Rossi"
                />
                {errors.ancestorName && <p className="text-red-500 text-sm mt-1">{errors.ancestorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to You</label>
                <select
                  value={formData.ancestorType}
                  onChange={(e) => setFormData(prev => ({...prev, ancestorType: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="great-grandparent">Great-grandparent</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Find Your Radici</h2>
            <p className="text-gray-600">Who will be applying for citizenship?</p>
          </div>

          <div className="space-y-4">
            {['spouse', 'children', 'siblings', 'cousins'].map(familyType => (
              <div key={familyType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.includeFamily.includes(familyType)}
                      onChange={() => toggleFamilyMember(familyType)}
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <div>
                      <span className="text-gray-700 font-medium capitalize">{familyType}</span>
                      {familyType === 'cousins' && (
                        <p className="text-xs text-gray-500">Who share the same Italian ancestor</p>
                      )}
                    </div>
                  </label>
                </div>
                
                {formData.includeFamily.includes(familyType) && (
                  <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <button
                      onClick={() => updateFamilyCount(familyType, formData.familyCounts[familyType] - 1)}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{formData.familyCounts[familyType]}</span>
                    <button
                      onClick={() => updateFamilyCount(familyType, formData.familyCounts[familyType] + 1)}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Creating Your Plan...' : 'Create Document Plan'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const getPersonProgress = useCallback((personId) => {
      const personDocs = documents.filter(doc => doc.familyMemberId === personId);
      const completed = personDocs.filter(doc => doc.status === 'complete').length;
      return { completed, total: personDocs.length };
    }, [documents]);

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
          <div className="flex items-center mb-2">
            <div className="relative mr-3">
              <div className="w-3 h-3 bg-red-300 rounded-full"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-4 bg-green-300 rounded-t-full"></div>
                <div className="w-4 h-3 bg-green-200 rounded-full mx-auto -mt-1"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold">Ciao, {user?.name}!</h1>
          </div>
          <p className="opacity-90">Your path to Italian citizenship</p>
        </div>

        <div className="p-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Overall Progress</h2>
              <span className="text-2xl font-bold text-yellow-700">{progressStats.progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.progressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{progressStats.completedDocs}</div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{progressStats.inProgressDocs}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">{progressStats.totalDocs}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
            {familyMembers.map(person => {
              const progress = getPersonProgress(person.id);
              const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
              
              return (
                <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {person.name || `${person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1)} ${
                           familyMembers.filter(m => m.relationship === person.relationship).length > 1 ?
                            ${familyMembers.filter(m => m.relationship === person.relationship).findIndex(m => m.id === person.id) + 1}` :
                            ''
                          }`}
                          {person.isPrimary && ' (You)'}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          ID: {person.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{person.relationship}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{progress.completed}/{progress.total}</div>
                      <div className="text-xs text-gray-500">{progressPercent}% complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentView('documents')}
            className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
          >
            Manage Documents
          </button>
        </div>
      </div>
    );
  };

  const DocumentsView = () => {
    const [selectedPerson, setSelectedPerson] = useState(familyMembers[0]?.id || null);
    const [showUpload, setShowUpload] = useState(null);

    useEffect(() => {
      if (!selectedPerson && familyMembers.length > 0) {
        setSelectedPerson(familyMembers[0].id);
      }
    }, [familyMembers, selectedPerson]);

    const updateDocumentStatus = useCallback((docId, status, notes = '') => {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, status, notes, updatedAt: new Date().toISOString() } : doc
      );
      setDocuments(updatedDocs);
      saveData(null, null, updatedDocs);
    }, [documents, saveData]);

    const handleImageUpload = useCallback((docId, file) => {
      if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedDocs = documents.map(doc => 
            doc.id === docId ? { 
              ...doc, 
              imageUrl: e.target.result,
              status: doc.status === 'not_started' ? 'in_progress' : doc.status,
              updatedAt: new Date().toISOString()
            } : doc
          );
          setDocuments(updatedDocs);
          saveData(null, null, updatedDocs);
          setShowUpload(null);
        };
        reader.readAsDataURL(file);
      } else {
        alert('File size must be less than 10MB');
      }
    }, [documents, saveData]);

    const handleCameraCapture = useCallback((docId) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        if (e.target.files[0]) {
          handleImageUpload(docId, e.target.files[0]);
        }
      };
      input.click();
    }, [handleImageUpload]);

    const removeImage = useCallback((docId) => {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, imageUrl: null, updatedAt: new Date().toISOString() } : doc
      );
      setDocuments(updatedDocs);
      saveData(null, null, updatedDocs);
    }, [documents, saveData]);

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
            className="text-white mb-2 flex items-center hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Document Management</h1>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Family Member</label>
            <select
              value={selectedPerson || ''}
              onChange={(e) => setSelectedPerson(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
            >
              {familyMembers.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name || person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1)}
                  {person.isPrimary && ' (You)'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Documents for {selectedPersonInfo?.name || selectedPersonInfo?.relationship}
            </h3>
            
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
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                          >
                            <Upload size={16} />
                            Replace
                          </button>
                          <button
                            onClick={() => removeImage(doc.id)}
                            className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-4">Add a photo of this document</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCameraCapture(doc.id)}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            <Camera size={16} />
                            Take Photo
                          </button>
                          <button
                            onClick={() => setShowUpload(doc.id)}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {showUpload === doc.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleImageUpload(doc.id, e.target.files[0]);
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded mb-4"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowUpload(null)}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCameraCapture(doc.id)}
                            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                          >
                            <Camera size={16} />
                            Camera
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {doc.status !== 'not_started' && (
                    <div className="mt-3">
                      <textarea
                        placeholder="Add notes about this document..."
                        value={doc.notes}
                        onChange={(e) => updateDocumentStatus(doc.id, doc.status, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                        rows="2"
                      />
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    {documentHelpText[doc.documentType]}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const FamilyTreeView = () => {
    const [editingMember, setEditingMember] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberType, setNewMemberType] = useState('');

    const updateFamilyMember = useCallback((memberId, updates) => {
      const updatedFamily = familyMembers.map(member => 
        member.id === memberId ? { ...member, ...updates } : member
      );
      setFamilyMembers(updatedFamily);
      saveData(null, updatedFamily, null);
      setEditingMember(null);
    }, [familyMembers, saveData]);

    const addFamilyMember = useCallback((memberData) => {
      const newId = Math.max(...familyMembers.map(m => m.id)) + 1;
      const newMember = {
        id: newId,
        name: memberData.name || '',
        relationship: memberData.relationship,
        birthYear: memberData.birthYear || '',
        birthState: memberData.birthState || '',
        isPrimary: false
      };

      const updatedFamily = [...familyMembers, newMember];
      setFamilyMembers(updatedFamily);

      // Generate required documents for the new family member
      const docTypes = getDocumentsForPerson(newMember);
      const newDocs = docTypes.map(docType => ({
        id: `${newMember.id}-${docType}`,
        familyMemberId: newMember.id,
        documentType: docType,
        status: 'not_started',
        imageUrl: null,
        notes: '',
        createdAt: new Date().toISOString()
      }));

      const updatedDocs = [...documents, ...newDocs];
      setDocuments(updatedDocs);
      saveData(null, updatedFamily, updatedDocs);
      setShowAddMember(false);
      setNewMemberType('');
    }, [familyMembers, documents, getDocumentsForPerson, saveData]);

    const removeFamilyMember = useCallback((memberId) => {
      if (window.confirm('Are you sure you want to remove this family member? This will also delete all their documents.')) {
        const updatedFamily = familyMembers.filter(member => member.id !== memberId);
        const updatedDocs = documents.filter(doc => doc.familyMemberId !== memberId);
        
        setFamilyMembers(updatedFamily);
        setDocuments(updatedDocs);
        saveData(null, updatedFamily, updatedDocs);
      }
    }, [familyMembers, documents, saveData]);

    const groupedMembers = useMemo(() => {
      const groups = {
        self: [],
        spouse: [],
        child: [],
        sibling: [],
        cousin: []
      };
      
      familyMembers.forEach(member => {
        if (groups[member.relationship]) {
          groups[member.relationship].push(member);
        }
      });
      
      return groups;
    }, [familyMembers]);

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="text-white mb-2 flex items-center hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Family Members</h1>
          <p className="text-sm opacity-90">All connected to {user?.ancestorName}</p>
        </div>

        <div className="p-6">
          {/* Italian Ancestor Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">🇮🇹 Italian-born Ancestor</h3>
            <p className="text-green-700 text-sm">
              <strong>{user?.ancestorName}</strong> - {user?.ancestorType}
            </p>
            <p className="text-green-600 text-xs mt-1">
              All family members below must be able to trace their lineage to this ancestor
            </p>
          </div>

          {/* Family Groups */}
          {Object.entries(groupedMembers).map(([relationship, members]) => {
            if (members.length === 0) return null;
            
            return (
              <div key={relationship} className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {relationship === 'self' ? 'Primary Applicant' : 
                     relationship === 'child' ? 'Children' :
                     relationship === 'sibling' ? 'Siblings' :
                     relationship === 'cousin' ? 'Cousins' : 
                     relationship}
                    {members.length > 1 && relationship !== 'self' && ` (${members.length})`}
                  </h3>
                  {relationship !== 'self' && relationship !== 'spouse' && (
                    <button
                      onClick={() => {
                        setNewMemberType(relationship);
                        setShowAddMember(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm"
                    >
                      <Plus size={16} />
                      Add {relationship === 'child' ? 'Child' : relationship === 'sibling' ? 'Sibling' : 'Cousin'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      {editingMember === member.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => setFamilyMembers(prev => 
                              prev.map(m => m.id === member.id ? {...m, name: e.target.value} : m)
                            )}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                            placeholder="Full legal name"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={member.birthYear}
                              onChange={(e) => setFamilyMembers(prev => 
                                prev.map(m => m.id === member.id ? {...m, birthYear: e.target.value} : m)
                              )}
                              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                              placeholder="Birth year"
                            />
                            <input
                              type="text"
                              value={member.birthState}
                              onChange={(e) => setFamilyMembers(prev => 
                                prev.map(m => m.id === member.id ? {...m, birthState: e.target.value} : m)
                              )}
                              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                              placeholder="Birth state/country"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateFamilyMember(member.id, member)}
                              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-1"
                            >
                              <Check size={16} />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMember(null)}
                              className="px-4 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {member.name || `${member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}`}
                              {member.isPrimary && ' (You)'}
                            </h4>
                            <p className="text-sm text-gray-600 capitalize">{member.relationship}</p>
                            {(member.birthYear || member.birthState) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {member.birthYear && `Born ${member.birthYear}`}
                                {member.birthYear && member.birthState && ' in '}
                                {member.birthState}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingMember(member.id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Settings size={16} />
                            </button>
                            {!member.isPrimary && (
                              <button
                                onClick={() => removeFamilyMember(member.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add Family Member Modal */}
          {showAddMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Add {newMemberType === 'child' ? 'Child' : newMemberType === 'sibling' ? 'Sibling' : 'Cousin'}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addFamilyMember({
                    name: formData.get('name'),
                    relationship: newMemberType,
                    birthYear: formData.get('birthYear'),
                    birthState: formData.get('birthState')
                  });
                }}>
                  <div className="space-y-3">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full legal name"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="birthYear"
                        type="text"
                        placeholder="Birth year"
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                      />
                      <input
                        name="birthState"
                        type="text"
                        placeholder="Birth state/country"
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                      This {newMemberType} must be able to trace their lineage to <strong>{user?.ancestorName}</strong>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setNewMemberType('child');
                  setShowAddMember(true);
                }}
                className="bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Child
              </button>
              <button
                onClick={() => {
                  setNewMemberType('sibling');
                  setShowAddMember(true);
                }}
                className="bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Sibling
              </button>
            </div>
            <button
              onClick={() => {
                setNewMemberType('cousin');
                setShowAddMember(true);
              }}
              className="w-full mt-3 bg-purple-50 text-purple-700 py-3 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Cousin
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const clearData = () => {
      if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear();
        setUser(null);
        setFamilyMembers([]);
        setDocuments([]);
        setCurrentView('onboarding');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="text-white mb-2 flex items-center hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
            <p className="text-gray-600 mb-4">
              This will permanently remove all your family and document information from this device.
            </p>
            <button
              onClick={clearData}
              className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About Radici.ai</h3>
            <div className="flex items-start space-x-3 mb-4">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-4 bg-green-500 rounded-t-full"></div>
                  <div className="w-4 h-3 bg-green-400 rounded-full mx-auto -mt-1"></div>
                </div>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Radici</strong> means "roots" in Italian. We help you trace your Italian roots 
                  and organize your citizenship application documents.
                </p>
                <p className="text-gray-600 text-sm">
                  All data is stored locally on your device for privacy and security.
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 border-t pt-3">
              <div>radici.ai • Version 1.0</div>
              <div>Your Italian Roots, Your Rights</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BottomNav = () => {
    if (currentView === 'onboarding') return null;

    const navItems = [
      { key: 'dashboard', icon: Home, label: 'Dashboard' },
      { key: 'documents', icon: FileText, label: 'Documents' },
                  { key: 'family-tree', icon: Users, label: 'Family' },
      { key: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`flex flex-col items-center py-1 ${
                currentView === key ? 'text-yellow-600' : 'text-gray-600'
              } hover:text-yellow-500 transition-colors`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {currentView === 'onboarding' && <OnboardingView />}
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'documents' && <DocumentsView />}
      {currentView === 'family-tree' && <FamilyTreeView />}
      {currentView === 'settings' && <SettingsView />}
      <BottomNav />
    </div>
  );
};

export default RadiciApp;
