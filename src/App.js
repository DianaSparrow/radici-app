import React, { useState, useEffect } from 'react';

const RadiciApp = () => {
  const [currentView, setCurrentView] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);

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

  const getDocumentsForPerson = (person) => {
    let docs = ['birth_certificate', 'photo_id'];
    
    if (person.relationship === 'spouse' || person.relationship === 'self') {
      docs.push('marriage_certificate');
    }
    
    if (person.relationship === 'self') {
      docs.push('italian_ancestor_birth');
      docs.push('naturalization_records');
    }
    
    return docs;
  };

  const documentDisplayNames = {
    birth_certificate: 'Birth Certificate',
    marriage_certificate: 'Marriage Certificate',
    photo_id: 'Photo ID/Passport',
    italian_ancestor_birth: 'Italian Ancestor Birth Certificate',
    naturalization_records: 'Naturalization Records'
  };

  const saveData = (userData, familyData, documentsData) => {
    if (userData) localStorage.setItem('radici_user', JSON.stringify(userData));
    if (familyData) localStorage.setItem('radici_family', JSON.stringify(familyData));
    if (documentsData) localStorage.setItem('radici_documents', JSON.stringify(documentsData));
  };

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

    const handleSubmit = () => {
      const userData = {
        name: formData.name,
        ancestorName: formData.ancestorName,
        ancestorType: formData.ancestorType
      };

      const family = [
        {
          id: 1,
          name: formData.name,
          relationship: 'self',
          birthYear: '',
          birthState: '',
          isPrimary: true
        }
      ];

      let nextId = 2;
      
      // Add spouses (usually just 1)
      if (formData.includeFamily.includes('spouse')) {
        for (let i = 0; i < formData.familyCounts.spouse; i++) {
          family.push({
            id: nextId++,
            name: '',
            relationship: 'spouse',
            birthYear: '',
            birthState: '',
            isPrimary: false
          });
        }
      }
      
      // Add children (can be multiple)
      if (formData.includeFamily.includes('children')) {
        for (let i = 0; i < formData.familyCounts.children; i++) {
          family.push({
            id: nextId++,
            name: '',
            relationship: 'child',
            birthYear: '',
            birthState: '',
            isPrimary: false
          });
        }
      }
      
      // Add siblings (can be multiple)
      if (formData.includeFamily.includes('siblings')) {
        for (let i = 0; i < formData.familyCounts.siblings; i++) {
          family.push({
            id: nextId++,
            name: '',
            relationship: 'sibling',
            birthYear: '',
            birthState: '',
            isPrimary: false
          });
        }
      }
      
      // Add cousins (can be multiple)
      if (formData.includeFamily.includes('cousins')) {
        for (let i = 0; i < formData.familyCounts.cousins; i++) {
          family.push({
            id: nextId++,
            name: '',
            relationship: 'cousin',
            birthYear: '',
            birthState: '',
            isPrimary: false
          });
        }
      }

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
            notes: ''
          });
        });
      });

      setUser(userData);
      setFamilyMembers(family);
      setDocuments(allDocs);
      saveData(userData, family, allDocs);
      setCurrentView('dashboard');
    };

    const updateFamilyCount = (type, count) => {
      setFormData({
        ...formData,
        familyCounts: {
          ...formData.familyCounts,
          [type]: Math.max(1, Math.min(10, count)) // Limit between 1-10
        }
      });
    };

    if (step === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-6">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Radici</h1>
              <p className="text-gray-600">Let's organize your Italian heritage documents</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Italian-born Ancestor</label>
                <input
                  type="text"
                  value={formData.ancestorName}
                  onChange={(e) => setFormData({...formData, ancestorName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Giuseppe Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to You</label>
                <select
                  value={formData.ancestorType}
                  onChange={(e) => setFormData({...formData, ancestorType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.ancestorName}
                className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Who to Include?</h2>
            <p className="text-gray-600">Select family members for your application</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includeFamily.includes('spouse')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({...formData, includeFamily: [...formData.includeFamily, 'spouse']});
                  } else {
                    setFormData({...formData, includeFamily: formData.includeFamily.filter(f => f !== 'spouse')});
                  }
                }}
                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <span className="text-gray-700 flex-1">Spouse</span>
            </label>

            <div className="border-l-2 border-gray-200 pl-6 space-y-3">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.includeFamily.includes('children')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, includeFamily: [...formData.includeFamily, 'children']});
                      } else {
                        setFormData({...formData, includeFamily: formData.includeFamily.filter(f => f !== 'children')});
                      }
                    }}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <span className="text-gray-700">Children</span>
                </div>
                {formData.includeFamily.includes('children') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateFamilyCount('children', formData.familyCounts.children - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{formData.familyCounts.children}</span>
                    <button
                      onClick={() => updateFamilyCount('children', formData.familyCounts.children + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.includeFamily.includes('siblings')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, includeFamily: [...formData.includeFamily, 'siblings']});
                      } else {
                        setFormData({...formData, includeFamily: formData.includeFamily.filter(f => f !== 'siblings')});
                      }
                    }}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <span className="text-gray-700">Siblings</span>
                </div>
                {formData.includeFamily.includes('siblings') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateFamilyCount('siblings', formData.familyCounts.siblings - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{formData.familyCounts.siblings}</span>
                    <button
                      onClick={() => updateFamilyCount('siblings', formData.familyCounts.siblings + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.includeFamily.includes('cousins')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, includeFamily: [...formData.includeFamily, 'cousins']});
                      } else {
                        setFormData({...formData, includeFamily: formData.includeFamily.filter(f => f !== 'cousins')});
                      }
                    }}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <span className="text-gray-700">Cousins</span>
                    <p className="text-xs text-gray-500">Who share the same Italian ancestor</p>
                  </div>
                </div>
                {formData.includeFamily.includes('cousins') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateFamilyCount('cousins', formData.familyCounts.cousins - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{formData.familyCounts.cousins}</span>
                    <button
                      onClick={() => updateFamilyCount('cousins', formData.familyCounts.cousins + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600"
            >
              Create My Document Plan
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const totalDocs = documents.length;
    const completedDocs = documents.filter(doc => doc.status === 'complete').length;
    const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

    const getPersonProgress = (personId) => {
      const personDocs = documents.filter(doc => doc.familyMemberId === personId);
      const completed = personDocs.filter(doc => doc.status === 'complete').length;
      return { completed, total: personDocs.length };
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Your Italian Roots, Your Rights</h1>
          <p className="opacity-90">Document collection progress</p>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Document Collection Progress</h2>
              <span className="text-xl font-bold text-yellow-700">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{completedDocs} of {totalDocs} documents collected</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
            {familyMembers.map(person => {
              const progress = getPersonProgress(person.id);
              const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
              
              return (
                <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {person.name || `${person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1)}`}
                        {person.isPrimary && ' (You)'}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">{person.relationship}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{progress.completed}/{progress.total}</div>
                      <div className="text-xs text-gray-500">{progressPercent}% complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentView('documents')}
            className="w-full mt-6 bg-yellow-500 text-white font-semibold py-4 rounded-lg hover:bg-yellow-600"
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

    const updateDocumentStatus = (docId, status, notes = '') => {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, status, notes } : doc
      );
      setDocuments(updatedDocs);
      saveData(null, null, updatedDocs);
    };

    const handleImageUpload = (docId, file) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedDocs = documents.map(doc => 
            doc.id === docId ? { 
              ...doc, 
              imageUrl: e.target.result,
              status: doc.status === 'not_started' ? 'in_progress' : doc.status
            } : doc
          );
          setDocuments(updatedDocs);
          saveData(null, null, updatedDocs);
          setShowUpload(null);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleCameraCapture = (docId) => {
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
    };

    const removeImage = (docId) => {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, imageUrl: null } : doc
      );
      setDocuments(updatedDocs);
      saveData(null, null, updatedDocs);
    };

    const selectedPersonDocs = documents.filter(doc => doc.familyMemberId === selectedPerson);
    const selectedPersonInfo = familyMembers.find(p => p.id === selectedPerson);

    if (familyMembers.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No family members found. Please add family members first.</p>
            <button
              onClick={() => setCurrentView('family-tree')}
              className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
            >
              Go to Family Tree
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
            className="text-white mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Document Management</h1>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Family Member</label>
            <select
              data-person-selector
              value={selectedPerson || ''}
              onChange={(e) => setSelectedPerson(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-600">No documents found for this family member.</p>
              </div>
            ) : (
              selectedPersonDocs.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {documentDisplayNames[doc.documentType]}
                      </h4>
                      <div className="mt-2">
                        <select
                          value={doc.status}
                          onChange={(e) => updateDocumentStatus(doc.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-yellow-500"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="complete">Complete</option>
                        </select>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'complete' ? 'bg-green-100 text-green-800' :
                      doc.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status === 'complete' ? '✓ Complete' :
                       doc.status === 'in_progress' ? '⏳ In Progress' : '○ Not Started'}
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
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
                          >
                            Replace Image
                          </button>
                          <button
                            onClick={() => removeImage(doc.id)}
                            className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-gray-400 mb-3">
                          <div className="w-12 h-12 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                            📄
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Add a photo of this document</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCameraCapture(doc.id)}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            📸 Take Photo
                          </button>
                          <button
                            onClick={() => setShowUpload(doc.id)}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-2"
                          >
                            📁 Upload Image
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
                            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                          >
                            Use Camera
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
                    {doc.documentType === 'birth_certificate' && 'Usually obtained from state vital records office'}
                    {doc.documentType === 'marriage_certificate' && 'Usually obtained from county clerk or vital records'}
                    {doc.documentType === 'photo_id' && 'Driver\'s license, state ID, or passport'}
                    {doc.documentType === 'italian_ancestor_birth' && 'Request from Italian municipality'}
                    {doc.documentType === 'naturalization_records' && 'USCIS FOIA request or court records'}
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
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-800 to-yellow-700 text-white p-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="text-white mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Family Tree</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Tree Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Interactive family tree with name change tracking and document connections will be available in the next update.
            </p>
            <button
              onClick={() => setCurrentView('documents')}
              className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
            >
              Manage Documents
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
            className="text-white mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
            <button
              onClick={clearData}
              className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600"
            >
              Clear All Data
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will remove all your family and document information.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const BottomNav = () => {
    if (currentView === 'onboarding') return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center ${currentView === 'dashboard' ? 'text-yellow-600' : 'text-gray-600'}`}
          >
            <div className="w-6 h-6 mb-1 bg-current rounded opacity-80"></div>
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('documents')}
            className={`flex flex-col items-center ${currentView === 'documents' ? 'text-yellow-600' : 'text-gray-600'}`}
          >
            <div className="w-6 h-6 mb-1 bg-current rounded opacity-80"></div>
            <span className="text-xs">Documents</span>
          </button>
          <button
            onClick={() => setCurrentView('family-tree')}
            className={`flex flex-col items-center ${currentView === 'family-tree' ? 'text-yellow-600' : 'text-gray-600'}`}
          >
            <div className="w-6 h-6 mb-1 bg-current rounded opacity-80"></div>
            <span className="text-xs">Family Tree</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center ${currentView === 'settings' ? 'text-yellow-600' : 'text-gray-600'}`}
          >
            <div className="w-6 h-6 mb-1 bg-current rounded opacity-80"></div>
            <span className="text-xs">Settings</span>
          </button>
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
