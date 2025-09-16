import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
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

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
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

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6">
      <style jsx global>{`
        :root {
          --primary: #0ea5e9;
          --secondary: #8b5cf6;
          --accent: #ec4899;
          --dark: #0f172a;
          --darker: #020617;
          --card: #1e293b;
          --border: #334155;
          --text: #f1f5f9;
          --text-secondary: #94a3b8;
          --success: #10b981;
          --error: #ef4444;
        }
        
        body {
          background-color: var(--darker);
          color: var(--text);
          font-family: 'Inter', sans-serif;
        }
        
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .admin-header {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .admin-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 2px;
        }
        
        .admin-card {
          background: var(--card);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
        }
        
        .admin-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.35);
        }
        
        .admin-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-card-title svg {
          width: 1.5rem;
          height: 1.5rem;
          color: var(--primary);
        }
        
        .form-control {
          margin-bottom: 1.25rem;
        }
        
        .label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .input, .textarea, .select {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--text);
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .input:focus, .textarea:focus, .select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
        }
        
        .input-error {
          border-color: var(--error);
        }
        
        .input-error:focus {
          border-color: var(--error);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }
        
        .error-message {
          display: block;
          margin-top: 0.25rem;
          color: var(--error);
          font-size: 0.85rem;
        }
        
        .flex-row {
          display: flex;
          gap: 1rem;
        }
        
        .w-half {
          width: 50%;
        }
        
        .test-case-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .test-case-title {
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          gap: 0.5rem;
        }
        
        .btn svg {
          width: 1rem;
          height: 1rem;
        }
        
        .btn-primary {
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          color: white;
        }
        
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .btn-error {
          background: var(--error);
          color: white;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }
        
        .test-case-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .test-case-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.5rem;
        }
        
        .code-block {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          position: relative;
        }
        
        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .code-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text);
          font-family: 'Fira Code', monospace;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 120px;
        }
        
        .code-textarea:focus {
          outline: none;
        }
        
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1rem;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        
        .submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }
        
        .language-tag {
          display: inline-block;
          background: rgba(14, 165, 233, 0.2);
          color: var(--primary);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>

      <div className="admin-container">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200"
            aria-label="Back to admin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="admin-header">Create New Problem</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">Title</label>
                <input
                  {...register('title')}
                  className={`input ${errors.title && 'input-error'}`}
                  placeholder="Enter problem title"
                />
                {errors.title && (
                  <span className="error-message">{errors.title.message}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label">Description</label>
                <textarea
                  {...register('description')}
                  className={`textarea ${errors.description && 'input-error'}`}
                  placeholder="Describe the problem in detail"
                  rows={6}
                />
                {errors.description && (
                  <span className="error-message">{errors.description.message}</span>
                )}
              </div>

              <div className="flex-row">
                <div className="form-control w-half">
                  <label className="label">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className={`select ${errors.difficulty && 'input-error'}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-control w-half">
                  <label className="label">Tag</label>
                  <select
                    {...register('tags')}
                    className={`select ${errors.tags && 'input-error'}`}
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
          </div>

          {/* Test Cases */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Test Cases
            </h2>
            
            {/* Visible Test Cases */}
            <div className="mb-8">
              <div className="test-case-header">
                <h3 className="test-case-title">Visible Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="btn btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Visible Case
                </button>
              </div>
              
              {visibleFields.map((field, index) => (
                <div key={field.id} className="test-case-card">
                  <div className="test-case-actions">
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-error btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">Input</label>
                    <input
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="e.g., [1,2,3]"
                      className="input"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">Output</label>
                    <input
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="e.g., 6"
                      className="input"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">Explanation</label>
                    <textarea
                      {...register(`visibleTestCases.${index}.explanation`)}
                      placeholder="Explain the test case"
                      className="textarea"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="test-case-header">
                <h3 className="test-case-title">Hidden Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="btn btn-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Hidden Case
                </button>
              </div>
              
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="test-case-card">
                  <div className="test-case-actions">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-error btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">Input</label>
                    <input
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="e.g., [4,5,6]"
                      className="input"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">Output</label>
                    <input
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="e.g., 15"
                      className="input"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Templates */}
          <div className="admin-card">
            <h2 className="admin-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code Templates
            </h2>
            
            <div className="space-y-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="space-y-4">
                  <div className="code-block-header">
                    <span className="language-tag">
                      {index === 0 ? 'C++' : 
                       index === 1 ? 'Java' : 
                       index === 2 ? 'JavaScript' : 
                       index === 3 ? 'Python' : 
                       index === 4 ? 'Rust' : 'Go'}
                    </span>
                  </div>
                  
                  <div className="code-block">
                    <div className="code-block-header">
                      <span>Initial Code</span>
                    </div>
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="code-textarea"
                      rows={8}
                    />
                  </div>
                  
                  <div className="code-block">
                    <div className="code-block-header">
                      <span>Reference Solution</span>
                    </div>
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="code-textarea"
                      rows={8}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Create Problem
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;