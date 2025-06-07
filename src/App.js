import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, Upload, Check, Clock, Circle, ArrowLeft, Users, FileText, Settings, Home, Trash2, Plus, Minus } from 'lucide-react';

const RadiciApp = () => {
  const [currentView, setCurrentView] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Memoized document requirements by relationship
  const getDocumentsForPerson = useCallback((person) => {
    const baseDocuments = ['birth_certificate'];
    
    if (person.relationship === 'spouse' || person.relationship === 'self') {
      baseDocuments.push('marriage_certificate');
    }
    
    if (person.relationship === 'self') {
      baseDocuments.push('italian_ancestor_birth', 'naturalization_records');
    }
    
    if (person.relationship === 'italian_ancestor') {
      const ancestorDocs = ['italian_birth_certificate', 'us_naturalization_file'];
      // Only add death certificate if ancestor is marked as deceased
      if (person.isDeceased) {
        ancestorDocs.push('death_certificate');
      }
      return ancestorDocs;
    }
    
    return baseDocuments;
  }, []);

  const documentDisplayNames = {
    birth_certificate: 'Birth Certificate',
    marriage_certificate: 'Marriage Certificate', 
    italian_ancestor_birth: 'Italian Ancestor Birth Certificate',
    naturalization_records: 'Naturalization Records',
    // Italian ancestor specific documents
    italian_birth_certificate: 'Italian Birth Certificate',
    us_naturalization_file: 'US Naturalization File',
    death_certificate: 'Death Certificate'
  };

  const documentHelpText = {
    birth_certificate: 'Usually obtained from state vital records office',
    marriage_certificate: 'Usually obtained from county clerk or vital records',
    italian_ancestor_birth: 'Request from Italian municipality (comune)',
    naturalization_records: 'USCIS FOIA request or court records',
    // Italian ancestor specific documents
    italian_birth_certificate: 'Request from Italian municipality where ancestor was born',
    us_naturalization_file: 'USCIS A-File or court naturalization records',
    death_certificate: 'From state/county where ancestor died'
  };

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
      firstName: '',
      birthLastName: '',
      ancestorFirstName: '',
      ancestorBirthLastName: '',
      ancestorType: 'grandparent',
      includeFamily: [],
      familyCounts: {
        children: 1,
        siblings: 1,
        cousins: 1
      }
    });
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
      const newErrors = {};
      if (!formData.firstName.trim()) newErrors.firstName = 'First & middle names are required';
      if (!formData.birthLastName.trim()) newErrors.birthLastName = 'Last name at birth is required';
      if (!formData.ancestorFirstName.trim()) newErrors.ancestorFirstName = 'Ancestor first & middle names are required';
      if (!formData.ancestorBirthLastName.trim()) newErrors.ancestorBirthLastName = 'Ancestor last name at birth is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      setLoading(true);
      
      try {
        const userData = {
          firstName: formData.firstName.trim(),
          birthLastName: formData.birthLastName.trim(),
          ancestorFirstName: formData.ancestorFirstName.trim(),
          ancestorBirthLastName: formData.ancestorBirthLastName.trim(),
          ancestorType: formData.ancestorType,
          createdAt: new Date().toISOString()
        };

        const family = [{
          id: 1,
          name: `${formData.firstName.trim()} ${formData.birthLastName.trim()}`,
          relationship: 'self',
          birthYear: '',
          birthState: '',
          isPrimary: true
        }];

        // Add Italian ancestor as a special entry
        family.push({
          id: 2,
          name: `${formData.ancestorFirstName.trim()} ${formData.ancestorBirthLastName.trim()}`,
          relationship: 'italian_ancestor',
          birthYear: '',
          birthState: 'Italy',
          isPrimary: false,
          isAncestor: true,
          isDeceased: null // Will be set later by user
        });

        let nextId = 3;
        
        // Add spouse (only one spouse allowed)
        if (formData.includeFamily.includes('spouse')) {
          family.push({
            id: nextId++,
            name: '',
            relationship: 'spouse',
            birthYear: '',
            birthState: '',
            isPrimary: false
          });
        }
        
        // Generate family members based on selections
        ['children', 'siblings', 'cousins'].forEach(familyType => {
          if (formData.includeFamily.includes(familyType)) {
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
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-6 bg-green-500 rounded-t-full"></div>
                    <div className="w-6 h-4 bg-green-400 rounded-full mx-auto -mt-1"></div>
                    <div className="w-4 h-3 bg-green-400 rounded-full mx-auto -mt-1"></div>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">radici.ai</h1>
              <p className="text-lg text-gray-700 font-medium mb-2">Your Italian Roots, Your Rights</p>
              <p className="text-gray-600">Your journey to Italian citizenship starts here</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First & middle names</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Marco Antonio"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last name at birth</label>
                <input
                  type="text"
                  value={formData.birthLastName}
                  onChange={(e) => setFormData(prev => ({...prev, birthLastName: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.birthLastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Rossi"
                />
                {errors.birthLastName && <p className="text-red-500 text-sm mt-1">{errors.birthLastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Italian Ancestor - First & middle names</label>
                <input
                  type="text"
                  value={formData.ancestorFirstName}
                  onChange={(e) => setFormData(prev => ({...prev, ancestorFirstName: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.ancestorFirstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Giuseppe"
                />
                {errors.ancestorFirstName && <p className="text-red-500 text-sm mt-1">{errors.ancestorFirstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Italian Ancestor - Last name at birth</label>
                <input
                  type="text"
                  value={formData.ancestorBirthLastName}
                  onChange={(e) => setFormData(prev => ({...prev, ancestorBirthLastName: e.target.value}))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.ancestorBirthLastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Rossi"
                />
                {errors.ancestorBirthLastName && <p className="text-red-500 text-sm mt-1">{errors.ancestorBirthLastName}</p>}
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Document Management</h2>
            <p className="text-gray-600">Whose documents would you like to manage?</p>
            <p className="text-xs text-gray-500 mt-2">Track documents for yourself and family members in your citizenship case</p>
          </div>

          <div className="space-y-4">
            {/* Spouse - Single checkbox, no counter */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.includeFamily.includes('spouse')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev, 
                        includeFamily: [...prev.includeFamily, 'spouse']
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev, 
                        includeFamily: prev.includeFamily.filter(f => f !== 'spouse')
                      }));
                    }
                  }}
                  className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Spouse</span>
                  <p className="text-xs text-gray-500">Your current spouse/partner</p>
                </div>
              </label>
            </div>

            {/* Children, Siblings, Cousins - With counters */}
            {['children', 'siblings', 'cousins'].map(familyType => (
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
                      {familyType === 'children' && (
                        <p className="text-xs text-gray-500">All your children (biological, adopted, step)</p>
                      )}
                      {familyType === 'siblings' && (
                        <p className="text-xs text-gray-500">Brothers and sisters applying together</p>
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
              {loading ? 'Setting Up Your Documents...' : 'Create Document Checklist'}
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
            <h1 className="text-2xl font-bold">Ciao, {user?.firstName}!</h1>
          </div>
          <p className="opacity-90">Document management dashboard</p>
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
              const relationshipGroup = familyMembers.filter(m => m.relationship === person.relationship);
              
              return (
                <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {person.name || `${person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1)}${relationshipGroup.length > 1 ? ` #${relationshipGroup.findIndex(m => m.id === person.id) + 1}` : ''}`}
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
    }, [familyMembers]); // Removed selectedPerson dependency to prevent reset

    const updateDocumentStatus = useCallback((docId, status, notes = '') => {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, status, notes, updatedAt: new Date().toISOString() } : doc
      );
      setDocuments(updatedDocs);
    }, [documents]);

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
          setShowUpload(null);
        };
        reader.readAsDataURL(file);
      } else {
        alert('File size must be less than 10MB');
      }
    }, [documents]);

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
    }, [documents]);

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
