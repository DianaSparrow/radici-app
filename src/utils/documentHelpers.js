// Document type definitions and display names
export const documentDisplayNames = {
  birth_certificate: 'Birth Certificate',
  marriage_certificate: 'Marriage Certificate', 
  italian_ancestor_birth: 'Italian Ancestor Birth Certificate',
  naturalization_records: 'Naturalization Records',
  // Italian ancestor specific documents
  italian_birth_certificate: 'Italian Birth Certificate',
  us_naturalization_file: 'US Naturalization File',
  death_certificate: 'Death Certificate'
};

// Help text for each document type
export const documentHelpText = {
  birth_certificate: 'Usually obtained from state vital records office',
  marriage_certificate: 'Usually obtained from county clerk or vital records',
  italian_ancestor_birth: 'Request from Italian municipality (comune)',
  naturalization_records: 'USCIS FOIA request or court records',
  // Italian ancestor specific documents
  italian_birth_certificate: 'Request from Italian municipality where ancestor was born',
  us_naturalization_file: 'USCIS A-File or court naturalization records',
  death_certificate: 'From state/county where ancestor died'
};

// Determine required documents for a person based on their relationship
export const getDocumentsForPerson = (person) => {
  const baseDocuments = ['birth_certificate'];
  
  if (person.relationship === 'spouse' || person.relationship === 'self') {
    baseDocuments.push('marriage_certificate');
  }
  
  // Add parent documents when ancestor is grandparent or great-grandparent
  if (person.relationship === 'parent') {
    baseDocuments.push('marriage_certificate'); // Parent's marriage cert
    return baseDocuments;
  }
  
  if (person.relationship === 'italian_ancestor') {
    const ancestorDocs = ['italian_birth_certificate', 'us_naturalization_file'];
    if (person.isDeceased) {
      ancestorDocs.push('death_certificate');
    }
    return ancestorDocs;
  }
  
  return baseDocuments;
};

// Generate document objects for a family member
export const generateDocumentsForPerson = (person) => {
  const docTypes = getDocumentsForPerson(person);
  return docTypes.map(docType => ({
    id: `${person.id}-${docType}`,
    familyMemberId: person.id,
    documentType: docType,
    status: 'not_started',
    imageUrl: null,
    notes: '',
    createdAt: new Date().toISOString()
  }));
};

// Calculate progress for a specific person
export const getPersonProgress = (personId, documents) => {
  const personDocs = documents.filter(doc => doc.familyMemberId === personId);
  const completed = personDocs.filter(doc => doc.status === 'complete').length;
  return { completed, total: personDocs.length };
};

// Group family members by relationship type
export const groupMembersByRelationship = (familyMembers) => {
  const groups = {
    italian_ancestor: [],
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
};

// Relationship display labels
export const relationshipLabels = {
  italian_ancestor: 'Italian Ancestor Documents',
  self: 'Primary Applicant',
  spouse: 'Spouse',
  child: 'Children',
  sibling: 'Siblings',
  cousin: 'Cousins'
};

// Validate image file for upload
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
  }
  
  return { valid: true };
};

// Format display name for family member
export const formatMemberDisplayName = (member, groupedMembers) => {
  if (member.name) {
    return member.name;
  }
  
  const relationshipGroup = groupedMembers[member.relationship] || [];
  const baseTitle = member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1).replace('_', ' ');
  
  if (relationshipGroup.length > 1) {
    const index = relationshipGroup.findIndex(m => m.id === member.id) + 1;
    return `${baseTitle} #${index}`;
  }
  
  return baseTitle;
};
