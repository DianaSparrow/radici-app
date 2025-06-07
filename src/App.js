import React, { useState, useCallback, useMemo } from 'react';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import DocumentsView from './components/DocumentsView';
// import FamilyTreeView from './components/FamilyTreeView';
import SettingsView from './components/SettingsView';
import BottomNav from './components/BottomNav';
import { getDocumentsForPerson } from './utils/documentHelpers';

const App = () => {
  // Core app state
  const [currentView, setCurrentView] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Progress calculation with memoization
  const progressStats = useMemo(() => {
    const totalDocs = documents.length;
    const completedDocs = documents.filter(doc => doc.status === 'complete').length;
    const inProgressDocs = documents.filter(doc => doc.status === 'in_progress').length;
    const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
    
    return { totalDocs, completedDocs, inProgressDocs, progressPercent };
  }, [documents]);

  // Onboarding completion handler
  const handleOnboardingComplete = useCallback((onboardingData) => {
    setLoading(true);
    
    try {
      const { userData, familyData, documentsData } = onboardingData;
      setUser(userData);
      setFamilyMembers(familyData);
      setDocuments(documentsData);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Document status update handler
  const updateDocumentStatus = useCallback((docId, status, notes = '') => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, status, notes, updatedAt: new Date().toISOString() } : doc
    );
    setDocuments(updatedDocs);
  }, [documents]);

  // Image upload handler for documents
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
      };
      reader.readAsDataURL(file);
      return true;
    } else {
      alert('File size must be less than 10MB');
      return false;
    }
  }, [documents]);

  // Remove image from document
  const removeDocumentImage = useCallback((docId) => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, imageUrl: null, updatedAt: new Date().toISOString() } : doc
    );
    setDocuments(updatedDocs);
  }, [documents]);

  // Family member update handler
  const updateFamilyMember = useCallback((memberId, updates) => {
    const updatedFamily = familyMembers.map(member => 
      member.id === memberId ? { ...member, ...updates } : member
    );
    setFamilyMembers(updatedFamily);

    // If updating ancestor's deceased status, regenerate their documents
    const updatedMember = updatedFamily.find(m => m.id === memberId);
    if (updatedMember && updatedMember.relationship === 'italian_ancestor' && 'isDeceased' in updates) {
      // Remove old ancestor documents
      const filteredDocs = documents.filter(doc => doc.familyMemberId !== memberId);
      
      // Generate new documents based on deceased status
      const docTypes = getDocumentsForPerson(updatedMember);
      const newDocs = docTypes.map(docType => ({
        id: `${memberId}-${docType}`,
        familyMemberId: memberId,
        documentType: docType,
        status: 'not_started',
        imageUrl: null,
        notes: '',
        createdAt: new Date().toISOString()
      }));

      const allUpdatedDocs = [...filteredDocs, ...newDocs];
      setDocuments(allUpdatedDocs);
    }
  }, [familyMembers, documents]);

  // Add new family member
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
  }, [familyMembers, documents]);

  // Remove family member
  const removeFamilyMember = useCallback((memberId) => {
    if (window.confirm('Are you sure you want to remove this family member? This will also delete all their documents.')) {
      const updatedFamily = familyMembers.filter(member => member.id !== memberId);
      const updatedDocs = documents.filter(doc => doc.familyMemberId !== memberId);
      
      setFamilyMembers(updatedFamily);
      setDocuments(updatedDocs);
    }
  }, [familyMembers, documents]);

  // Clear all data (reset app)
  const clearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setUser(null);
      setFamilyMembers([]);
      setDocuments([]);
      setCurrentView('onboarding');
    }
  }, []);

  // Shared props for all components
  const sharedProps = {
    user,
    familyMembers,
    documents,
    loading,
    progressStats,
    setCurrentView,
    updateDocumentStatus,
    handleImageUpload,
    removeDocumentImage,
    updateFamilyMember,
    addFamilyMember,
    removeFamilyMember,
    clearAllData
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {currentView === 'onboarding' && (
        <OnboardingView 
          onComplete={handleOnboardingComplete}
          loading={loading}
        />
      )}
      {currentView === 'dashboard' && (
        <DashboardView {...sharedProps} />
      )}
      {currentView === 'documents' && (
        <DocumentsView {...sharedProps} />
      )}
//      {currentView === 'family-tree' && (
//        <FamilyTreeView {...sharedProps} />
//      )}
      {currentView === 'settings' && (
        <SettingsView {...sharedProps} />
     )}
      <BottomNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
    </div>
  );
};
export default App;
