import React, { useState, useRef, useEffect, useCallback } from 'react';

// Define initial CV state outside the component so it can be reset
const initialSections = [
  {
    id: 'work-experience',
    title: 'Work Experience',
    type: 'standard',
    entries: [
      { id: 'we-1', startDate: 'Jan 2020', endDate: 'Present', title: 'Senior Developer', description: 'Developed and maintained full-stack applications. Led a team of 5 junior developers.' },
      { id: 'we-2', startDate: 'Mar 2018', endDate: 'Dec 2019', title: 'Junior Software Engineer', description: 'Assisted in building a new e-commerce platform.' },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    type: 'standard',
    entries: [
      { id: 'edu-1', startDate: 'Sep 2014', endDate: 'May 2018', title: 'B.Sc. in Computer Science', description: 'University of Technology' },
    ],
  },
  {
    id: 'knowledge-skills',
    title: 'Knowledge & Skills',
    type: 'skills',
    entries: [
      { id: 'ks-1', type: 'language', name: 'English', level: 5 },
      { id: 'ks-2', type: 'language', name: 'Spanish', level: 3 },
      { id: 'ks-3', type: 'pc-skill', name: 'React', level: 5 },
      { id: 'ks-4', type: 'pc-skill', name: 'Tailwind CSS', level: 4 },
    ],
  },
  {
    id: 'voluntary-engagement',
    title: 'Voluntary Engagement',
    type: 'standard',
    entries: [
      { id: 've-1', startDate: 'Jan 2021', endDate: 'Present', title: 'Community Volunteer', description: 'Organized local charity events and food drives.' },
    ],
  },
];

const initialPersonal = {
  name: 'John Doe',
  title: 'Senior Full-Stack Developer',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  location: 'Anytown, USA',
  linkedin: 'linkedin.com/in/johndoe',
};

// Main App Component
const App = () => {
  // Use a ref to store the history of CV states for the undo functionality
  const historyRef = useRef([]);
  // Use a ref to track the current index in the history
  const historyIndexRef = useRef(-1);

  // Default theme color
  const defaultThemeColor = '#9C1C38';

  // Define state for the CV
  const [personalInfo, setPersonalInfo] = useState(initialPersonal);
  const [sections, setSections] = useState(initialSections);
  const [themeColor, setThemeColor] = useState(defaultThemeColor);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [pageBreaks, setPageBreaks] = useState([]);

  // Refs for each page to calculate height for page breaks
  const pageRefs = useRef([]);

  // Use a useCallback to memoize the push to history
  const pushToHistory = useCallback((newSectionsState) => {
    // If we're not at the end of the history (i.e., we've undone something),
    // we need to truncate the history before adding a new state.
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    historyRef.current.push(newSectionsState);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // Update history whenever sections state changes
  useEffect(() => {
    pushToHistory(sections);
  }, [sections, pushToHistory]);

  // Function to calculate page breaks based on content height
  const calculatePageBreaks = useCallback(() => {
    const pageBreaks = [];
    const a4Height = 1123; // A4 size in pixels at 96 DPI (297mm * 96/25.4)
    let currentHeight = 0;
    
    // First, add the height of the personal info section
    const personalInfoEl = document.querySelector('.personal-info-section');
    if (personalInfoEl) {
      currentHeight += personalInfoEl.scrollHeight;
    }
    
    document.querySelectorAll('.cv-page-section').forEach((page, index) => {
      currentHeight += page.scrollHeight;

      if (currentHeight > a4Height) {
        pageBreaks.push(index + 1);
        currentHeight = page.scrollHeight; // Start new page height calculation with the current section's height
      }
    });

    setPageBreaks(pageBreaks);
  }, []);

  // Recalculate page breaks on every state change
  useEffect(() => {
    const timeoutId = setTimeout(calculatePageBreaks, 50);
    return () => clearTimeout(timeoutId);
  }, [sections, personalInfo, calculatePageBreaks]);

  // Handle updates to entries within a section
  const handleEntryChange = (sectionId, entryId, key, value) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              entries: section.entries.map(entry =>
                entry.id === entryId ? { ...entry, [key]: value } : entry
              ),
            }
          : section
      )
    );
  };

  // Add a new entry to a section
  const handleAddEntry = (sectionId, type) => {
    const newEntryId = Date.now().toString(); // Simple unique ID
    let newEntry;

    if (type === 'standard') {
      newEntry = {
        id: newEntryId,
        startDate: 'Start Date',
        endDate: 'End Date',
        title: 'New Title',
        description: 'New Description',
      };
    } else { // type === 'skills'
      newEntry = {
        id: newEntryId,
        type: type === 'language' ? 'language' : 'pc-skill',
        name: 'New Skill',
        level: 1,
      };
    }
    
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, entries: [...section.entries, newEntry] }
          : section
      )
    );
  };

  // Delete an entry from a section
  const handleDeleteEntry = (sectionId, entryId) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              entries: section.entries.filter(entry => entry.id !== entryId),
            }
          : section
      )
    );
  };

  // Move an entry up or down within a section
  const handleMoveEntry = (sectionId, entryId, direction) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          const entryIndex = section.entries.findIndex(e => e.id === entryId);
          if (entryIndex === -1) return section;

          const newEntries = [...section.entries];
          const newIndex = direction === 'up' ? entryIndex - 1 : entryIndex + 1;
          
          if (newIndex >= 0 && newIndex < newEntries.length) {
            const [movedEntry] = newEntries.splice(entryIndex, 1);
            newEntries.splice(newIndex, 0, movedEntry);
            return { ...section, entries: newEntries };
          }
        }
        return section;
      })
    );
  };

  // Add a new section
  const handleAddSection = (index) => {
    const newSectionId = Date.now().toString();
    const newSection = {
      id: newSectionId,
      title: 'New Section',
      type: 'standard',
      entries: [],
    };
    setSections(prevSections => {
      const newSections = [...prevSections];
      newSections.splice(index + 1, 0, newSection);
      return newSections;
    });
  };

  // Delete a section
  const handleDeleteSection = (sectionId) => {
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
  };

  // Reorder sections (move up or down)
  const handleMoveSection = (sectionId, direction) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const index = newSections.findIndex(s => s.id === sectionId);
      if (index === -1) return newSections;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < newSections.length) {
        const [movedSection] = newSections.splice(index, 1);
        newSections.splice(newIndex, 0, movedSection);
        return newSections;
      }
      return newSections;
    });
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      historyIndexRef.current = newIndex;
      setSections(historyRef.current[newIndex]);
    }
  };

  // Reset functionality using a modal
  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    setSections(initialSections);
    setPersonalInfo(initialPersonal);
    setIsResetModalOpen(false);
  };

  // Print to PDF functionality
  const handlePrint = () => {
    window.print();
  };

  // Function to render the correct component for each section type
  const renderSection = (section, index) => {
    switch (section.type) {
      case 'standard':
        return (
          <StandardSection
            key={section.id}
            section={section}
            onEntryChange={handleEntryChange}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onMoveEntry={handleMoveEntry}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            key={section.id}
            section={section}
            onSkillChange={(entryId, key, value) => handleEntryChange(section.id, entryId, key, value)}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onMoveEntry={handleMoveEntry}
          />
        );
      default:
        return null;
    }
  };

  // Main JSX structure
  return (
    <div style={{ '--theme-color': themeColor }} className="font-poppins bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-20" style={{ backgroundColor: themeColor }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold rounded-lg p-2">CV Creator</h1>
          <div className="flex items-center">
            {/* Toolbar Buttons */}
            <div className="flex space-x-4">
              <button
                className="bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-200 transition-colors"
                onClick={handleReset}
                title="Reset"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m3.94-2.828a1 1 0 011.414 0L12 8.586l2.056-2.056a1 1 0 011.414 1.414L13.414 10l2.056 2.056a1 1 0 01-1.414 1.414L12 11.414l-2.056 2.056a1 1 0 01-1.414-1.414L10.586 10l-2.056-2.056z" />
                </svg>
              </button>
              <button
                className="bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-200 transition-colors"
                onClick={handleUndo}
                title="Undo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6-6-6-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 10H4a2 2 0 00-2 2v2a2 2 0 002 2h6" />
                </svg>
              </button>
              <button
                className="bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-200 transition-colors"
                onClick={handlePrint}
                title="Print as PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2M17 9V3a2 2 0 00-2-2H9a2 2 0 00-2 2v6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14v4a2 2 0 01-2 2H10a2 2 0 01-2-2v-4a2 2 0 01-2-2h8a2 2 0 01-2 2z" />
                </svg>
              </button>
              <input
                type="color"
                className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border-none p-0"
                style={{ backgroundColor: themeColor, border: 'none', WebkitAppearance: 'none' }}
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                title="Theme Color"
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Reset</h3>
            <p>Are you sure you want to reset your CV? All changes will be lost.</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={confirmReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-24 pb-8 px-4 flex flex-col items-center print:pt-0 print:pb-0">
        <div className="bg-white shadow-xl rounded-lg w-full max-w-4xl p-12 mb-8 personal-info-section" style={{ backgroundColor: themeColor, color: 'white' }}>
          <h2 className="text-4xl font-bold rounded-lg mb-2">
            <input
              type="text"
              className="w-full bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-2"
              value={personalInfo.name}
              onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})}
            />
          </h2>
          <p className="text-lg font-light">
            <input
              type="text"
              className="w-full bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-2"
              value={personalInfo.title}
              onChange={e => setPersonalInfo({...personalInfo, title: e.target.value})}
            />
          </p>
          <div className="flex flex-wrap text-sm mt-4 -m-1">
            <span className="m-1">
              <input
                type="text"
                className="bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-1"
                value={personalInfo.email}
                onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
              />
            </span>
            <span className="m-1">
              <input
                type="text"
                className="bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-1"
                value={personalInfo.phone}
                onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
              />
            </span>
            <span className="m-1">
              <input
                type="text"
                className="bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-1"
                value={personalInfo.location}
                onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})}
              />
            </span>
            <span className="m-1">
              <input
                type="text"
                className="bg-transparent outline-none focus:bg-white focus:bg-opacity-20 rounded-lg p-1"
                value={personalInfo.linkedin}
                onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
              />
            </span>
          </div>
        </div>

        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {/* The main CV content wrapped in a page container */}
            <div className="bg-white shadow-xl rounded-lg w-full max-w-4xl p-12 mb-8 cv-page-section" ref={el => pageRefs.current[index] = el}>
              <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-2">
                <h2 className="text-4xl font-bold rounded-lg">{section.title}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                    onClick={() => handleMoveSection(section.id, 'up')}
                    disabled={index === 0}
                    title="Move section up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                    onClick={() => handleMoveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    title="Move section down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  <button
                    className="text-white bg-red-500 p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    onClick={() => handleDeleteSection(section.id)}
                    title="Delete section"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {renderSection(section, index)}
            </div>
            
            {/* Add New Section Button */}
            <button
              className="bg-gray-300 text-gray-700 p-4 rounded-full shadow-lg hover:bg-gray-400 transition-colors my-4"
              onClick={() => handleAddSection(index)}
              title="Add a new section"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* Page Break Line */}
            {pageBreaks.includes(index + 1) && (
              <div className="w-full max-w-4xl border-t-2 border-dashed border-gray-400 my-8 opacity-70"></div>
            )}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
};

// Standard Section Component
const StandardSection = ({ section, onEntryChange, onAddEntry, onDeleteEntry, onMoveEntry }) => (
  <div>
    <button
      className="bg-white text-gray-700 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-300 mb-4"
      onClick={() => onAddEntry(section.id, 'standard')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add Entry
    </button>
    {section.entries.map((entry, index) => (
      <div key={entry.id} className="relative group mb-8 pb-4 border-b border-gray-200 last:border-b-0">
        {/* Entry move and delete buttons */}
        <div className="absolute right-0 top-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors"
            onClick={() => onMoveEntry(section.id, entry.id, 'up')}
            disabled={index === 0}
            title="Move entry up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors"
            onClick={() => onMoveEntry(section.id, entry.id, 'down')}
            disabled={index === section.entries.length - 1}
            title="Move entry down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <button
            className="text-red-500 rounded-full bg-red-100 p-1"
            onClick={() => onDeleteEntry(section.id, entry.id)}
            title="Delete entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <input
              type="text"
              className="font-light w-full bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2"
              value={entry.startDate}
              onChange={e => onEntryChange(section.id, entry.id, 'startDate', e.target.value)}
            />
            <input
              type="text"
              className="font-light w-full bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2 mt-2"
              value={entry.endDate}
              onChange={e => onEntryChange(section.id, entry.id, 'endDate', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <input
              type="text"
              className="text-xl font-bold w-full bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2"
              value={entry.title}
              onChange={e => onEntryChange(section.id, entry.id, 'title', e.target.value)}
            />
            <textarea
              className="font-light w-full mt-2 bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2 resize-none"
              rows="3"
              value={entry.description}
              onChange={e => onEntryChange(section.id, entry.id, 'description', e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Skills Section Component
const SkillsSection = ({ section, onSkillChange, onAddEntry, onDeleteEntry, onMoveEntry }) => {
  const languages = section.entries.filter(e => e.type === 'language');
  const pcSkills = section.entries.filter(e => e.type === 'pc-skill');

  // Handle skill level change
  const handleLevelChange = (entryId, level) => {
    onSkillChange(entryId, 'level', level);
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Languages Column */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Languages</h3>
        {languages.map((skill, index) => (
          <div key={skill.id} className="relative group flex items-center mb-4">
            {/* Entry move and delete buttons */}
            <div className="absolute -left-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => onMoveEntry(section.id, skill.id, 'up')}
                disabled={index === 0}
                title="Move entry up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <button
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => onMoveEntry(section.id, skill.id, 'down')}
                disabled={index === languages.length - 1}
                title="Move entry down"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <button
                className="text-red-500 rounded-full bg-red-100 p-1"
                onClick={() => onDeleteEntry(section.id, skill.id)}
                title="Delete entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              className="font-medium bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2 mr-4 flex-grow"
              value={skill.name}
              onChange={e => onSkillChange(skill.id, 'name', e.target.value)}
            />
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded-full cursor-pointer transition-colors`}
                  style={{ backgroundColor: skill.level >= level ? 'var(--theme-color)' : '#e5e7eb' }}
                  onClick={() => handleLevelChange(skill.id, level)}
                ></div>
              ))}
            </div>
          </div>
        ))}
        <button
          className="mt-4 bg-gray-200 text-gray-700 p-2 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
          onClick={() => onAddEntry(section.id, 'language')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Language
        </button>
      </div>
      {/* PC Skills Column */}
      <div>
        <h3 className="text-2xl font-bold mb-4">PC Skills</h3>
        {pcSkills.map((skill, index) => (
          <div key={skill.id} className="relative group flex items-center mb-4">
            {/* Entry move and delete buttons */}
            <div className="absolute -left-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => onMoveEntry(section.id, skill.id, 'up')}
                disabled={index === 0}
                title="Move entry up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <button
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => onMoveEntry(section.id, skill.id, 'down')}
                disabled={index === pcSkills.length - 1}
                title="Move entry down"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <button
                className="text-red-500 rounded-full bg-red-100 p-1"
                onClick={() => onDeleteEntry(section.id, skill.id)}
                title="Delete entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              className="font-medium bg-transparent outline-none focus:bg-gray-100 rounded-lg p-2 mr-4 flex-grow"
              value={skill.name}
              onChange={e => onSkillChange(skill.id, 'name', e.target.value)}
            />
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded-full cursor-pointer transition-colors`}
                  style={{ backgroundColor: skill.level >= level ? 'var(--theme-color)' : '#e5e7eb' }}
                  onClick={() => handleLevelChange(skill.id, level)}
                ></div>
              ))}
            </div>
          </div>
        ))}
        <button
          className="mt-4 bg-gray-200 text-gray-700 p-2 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
          onClick={() => onAddEntry(section.id, 'pc-skill')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Skill
        </button>
      </div>
    </div>
  );
};

export default App;
