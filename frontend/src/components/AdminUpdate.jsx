import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum([
    'array',
    'string',
    'linkedList',
    'stack',
    'queue',
    'tree',
    'binaryTree',
    'binarySearchTree',
    'heap',
    'graph',
    'hashTable',
    'trie',
    'dp'
  ]),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum([
        'C++', 'Java', 'JavaScript', 'Python', 'Rust', 'Go', 'C#', 'PHP', 
        'Ruby', 'Swift', 'Kotlin', 'TypeScript', 'Scala', 'R', 'Dart', 
        'Elixir', 'Erlang', 'Haskell', 'Lua', 'Perl', 'Bash', 'C'
      ]),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).min(1, 'At least one language required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum([
        'C++', 'Java', 'JavaScript', 'Python', 'Rust', 'Go', 'C#', 'PHP', 
        'Ruby', 'Swift', 'Kotlin', 'TypeScript', 'Scala', 'R', 'Dart', 
        'Elixir', 'Erlang', 'Haskell', 'Lua', 'Perl', 'Bash', 'C'
      ]),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).min(1, 'At least one language required')
});

function AdminUpdate() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'testCases', 'code'
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' },
        { language: 'Python', initialCode: '' },
        { language: 'Rust', initialCode: '' },
        { language: 'Go', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' },
        { language: 'Python', completeCode: '' },
        { language: 'Rust', completeCode: '' },
        { language: 'Go', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  // Fetch all problems on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoadingProblems(true);
        const response = await axiosClient.get('/problem/getAllProblem');
        
        if (response.data && Array.isArray(response.data)) {
          setProblems(response.data);
          setFilteredProblems(response.data);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchProblems();
  }, []);

  // Filter problems based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProblems(problems);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = problems.filter(problem => 
      problem.title.toLowerCase().includes(term) ||
      problem.difficulty.toLowerCase().includes(term) ||
      problem.tags.toLowerCase().includes(term)
    );
    
    setFilteredProblems(filtered);
  }, [searchTerm, problems]);

  // Load selected problem data
  const handleProblemSelect = async (problem) => {
    if (!problem) {
      reset();
      setSelectedProblem(null);
      setActiveTab('basic');
      return;
    }

    try {
      setLoading(true);
      setSelectedProblem(problem);
      
      // Reset form with the fetched data
      reset({
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'easy',
        tags: problem.tags || 'array',
        visibleTestCases: problem.visibleTestCases || [],
        hiddenTestCases: problem.hiddenTestCases || [],
        startCode: problem.startCode || [
          { language: 'C++', initialCode: '' },
          { language: 'Java', initialCode: '' },
          { language: 'JavaScript', initialCode: '' },
          { language: 'Python', initialCode: '' },
          { language: 'Rust', initialCode: '' },
          { language: 'Go', initialCode: '' }
        ],
        referenceSolution: problem.referenceSolution || [
          { language: 'C++', completeCode: '' },
          { language: 'Java', completeCode: '' },
          { language: 'JavaScript', completeCode: '' },
          { language: 'Python', completeCode: '' },
          { language: 'Rust', completeCode: '' },
          { language: 'Go', completeCode: '' }
        ]
      });
    } catch (error) {
      console.error('Error loading problem:', error);
      setSelectedProblem(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedProblem) {
      alert('Please select a problem to update');
      return;
    }

    try {
      setLoading(true);
      await axiosClient.put(`/problem/update/${selectedProblem._id}`, data);
      alert('Problem updated successfully!');
      
      // Refresh the problem list
      const response = await axiosClient.get('/problem/getAllProblem');
      if (response.data && Array.isArray(response.data)) {
        setProblems(response.data);
        
        // Update the selected problem with new data
        const updatedProblem = response.data.find(p => p._id === selectedProblem._id);
        if (updatedProblem) {
          setSelectedProblem(updatedProblem);
        }
      }
    } catch (error) {
      console.error('Error updating problem:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-900/30 text-green-400 border-green-700';
      case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'hard': return 'bg-red-900/30 text-red-400 border-red-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200"
                aria-label="Back to admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-white">Update Problems</h1>
            </div>
            <p className="text-gray-400 mt-2">Select a problem to update its details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Problem List Panel */}
          <div className="bg-gray-850 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 lg:col-span-1">
            <div className="p-4 bg-gray-900 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Problem Library
              </h2>
              
              {/* Search Bar */}
              <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search problems..."
                />
              </div>
            </div>
            
            {/* Problems List */}
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {loadingProblems ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading problems...</p>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300 mt-4">No problems found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search or create a new problem</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-800">
                  {filteredProblems.map(problem => (
                    <li 
                      key={problem._id} 
                      className={`p-4 hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 ${
                        selectedProblem?._id === problem._id ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : ''
                      }`}
                      onClick={() => handleProblemSelect(problem)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-200 truncate max-w-[200px]">{problem.title}</h3>
                          <div className="flex items-center mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="ml-2 text-xs px-2 py-1 bg-indigo-900/30 text-indigo-300 rounded-full border border-indigo-700">
                              {problem.tags}
                            </span>
                          </div>
                        </div>
                        <button 
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            selectedProblem?._id === problem._id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {selectedProblem?._id === problem._id ? 'Editing' : 'Edit'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Update Form Panel */}
          <div className="bg-gray-850 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 lg:col-span-3">
            {selectedProblem ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Problem
                  </h2>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleProblemSelect(null)}
                      className="flex items-center text-sm text-gray-400 hover:text-gray-300 mr-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to list
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !isDirty}
                      className={`px-4 py-2 rounded-lg font-medium text-white shadow-lg transition-all duration-200 ${
                        loading || !isDirty 
                          ? 'bg-gray-700 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : 'Update Problem'}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-700 mb-6">
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === 'basic'
                          ? 'text-indigo-400 border-b-2 border-indigo-500'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('basic')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Info
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === 'testCases'
                          ? 'text-indigo-400 border-b-2 border-indigo-500'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('testCases')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Test Cases
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === 'code'
                          ? 'text-indigo-400 border-b-2 border-indigo-500'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('code')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Code Templates
                    </button>
                  </div>
                  
                  {/* Basic Info Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                        <input
                          {...register('title')}
                          className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.title ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter problem title"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea
                          {...register('description')}
                          className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[200px] ${
                            errors.description ? 'border-red-500' : ''
                          }`}
                          placeholder="Describe the problem in detail"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                          <select
                            {...register('difficulty')}
                            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors.difficulty ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Tag</label>
                          <select
                            {...register('tags')}
                            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors.tags ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="array">Array</option>
                            <option value="string">String</option>
                            <option value="linkedList">Linked List</option>
                            <option value="stack">Stack</option>
                            <option value="queue">Queue</option>
                            <option value="tree">Tree</option>
                            <option value="binaryTree">Binary Tree</option>
                            <option value="binarySearchTree">Binary Search Tree</option>
                            <option value="heap">Heap</option>
                            <option value="graph">Graph</option>
                            <option value="hashTable">Hash Table</option>
                            <option value="trie">Trie</option>
                            <option value="dp">DP</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Test Cases Tab */}
                  {activeTab === 'testCases' && (
                    <div className="space-y-8">
                      {/* Visible Test Cases */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-200">Visible Test Cases</h3>
                          <button
                            type="button"
                            onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                            className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Case
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {visibleFields.map((field, index) => (
                            <div key={field.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-400 text-sm">Test Case #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeVisible(index)}
                                  className="text-red-500 hover:text-red-400 text-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-gray-300 text-sm mb-1">Input</label>
                                  <input
                                    {...register(`visibleTestCases.${index}.input`)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
                                    placeholder="e.g., [1,2,3]"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 text-sm mb-1">Output</label>
                                  <input
                                    {...register(`visibleTestCases.${index}.output`)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
                                    placeholder="e.g., 6"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 text-sm mb-1">Explanation</label>
                                  <textarea
                                    {...register(`visibleTestCases.${index}.explanation`)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
                                    placeholder="Explain the test case"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Hidden Test Cases */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-200">Hidden Test Cases</h3>
                          <button
                            type="button"
                            onClick={() => appendHidden({ input: '', output: '' })}
                            className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Case
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {hiddenFields.map((field, index) => (
                            <div key={field.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-400 text-sm">Test Case #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeHidden(index)}
                                  className="text-red-500 hover:text-red-400 text-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-gray-300 text-sm mb-1">Input</label>
                                  <input
                                    {...register(`hiddenTestCases.${index}.input`)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
                                    placeholder="e.g., [4,5,6]"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-gray-300 text-sm mb-1">Output</label>
                                  <input
                                    {...register(`hiddenTestCases.${index}.output`)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
                                    placeholder="e.g., 15"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Code Templates Tab */}
                  {activeTab === 'code' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                              <span className="text-sm font-medium text-indigo-400">
                                {index === 0 ? 'C++' : 
                                 index === 1 ? 'Java' : 
                                 index === 2 ? 'JavaScript' : 
                                 index === 3 ? 'Python' : 
                                 index === 4 ? 'Rust' : 'Go'}
                              </span>
                            </div>
                            
                            <div className="p-4">
                              <div className="mb-4">
                                <label className="block text-gray-300 text-sm mb-2">Initial Code</label>
                                <textarea
                                  {...register(`startCode.${index}.initialCode`)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white font-mono min-h-[150px]"
                                  placeholder="Enter initial code"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 text-sm mb-2">Reference Solution</label>
                                <textarea
                                  {...register(`referenceSolution.${index}.completeCode`)}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white font-mono min-h-[150px]"
                                  placeholder="Enter complete solution"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gray-800 p-6 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-2">Select a Problem to Update</h3>
                <p className="text-gray-400 max-w-md">
                  Choose a problem from the list on the left to view and update its details.
                  You can search for problems by title, difficulty, or tags.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 Solution Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminUpdate;