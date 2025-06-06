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
      includeFamily: []
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
      if (formData.includeFamily.includes('children')) {
        family.push({
          id: nextId++,
          name: '',
          relationship: 'child',
          birthYear: '',
          birthState: '',
          isPrimary: false
        });
      }
      if (formData.includeFamily.includes('siblings')) {
        family.push({
          id: nextId++,
          name: '',
          relationship: 'sibling',
          birthYear: '',
          birthState: '',
          isPrimary: false
        });
      }
      if (formData.includeFamily.includes('cousins')) {
        family.push({
          id: nextId++,
          name: '',
          relationship: 'cousin',
          birthYear: '',
          birthState: '',
          isPrimary: false
        });
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

          <div className="space-y-3">
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
              <span className="text-gray-700">Spouse</span>
            </label>

            <label className="flex items-center space-x-3">
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
            </label>

            <label className="flex items-center space-x-3">
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
            </label>

            <label className="flex items-center space-x-3">
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
              <div>
                <span className="text-gray-700">Cousins</span>
                <p className="text-xs text-gray-500">Who share the same Italian ancestor</p>
              </div>
            </label>
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
      <BottomNav />
    </div>
  );
};

export default RadiciApp;
