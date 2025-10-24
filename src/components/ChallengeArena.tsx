'use client';

import React, { useState } from 'react';
import { Bug, Challenge, ComparisonResult } from '@/types';

export default function ChallengeArena() {
  const [currentBug, setCurrentBug] = useState<Bug | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [llmResults, setLlmResults] = useState<Record<string, Challenge>>({});
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [currentSolution, setCurrentSolution] = useState<string>('');
  const [solutionError, setSolutionError] = useState<string>('');
  const [processingLLMs, setProcessingLLMs] = useState<Record<string, boolean>>({});
  const [llmProgress, setLlmProgress] = useState<Record<string, string>>({});

  const startChallenge = async (bug: Bug) => {
    setCurrentBug(bug);
    setChallenge({
      startTime: Date.now(),
      endTime: null,
      solution: '',
    });
    // Trigger LLM debugging in parallel
    await startLLMDebugging(bug);
  };

  const startLLMDebugging = async (bug: Bug) => {
    // Example LLM models to test against
    const models = ['gpt-4', 'claude-3', 'cohere'];
    
    const llmChallenges: Record<string, Challenge> = {};
    
    // Initialize processing state for all models
    const initialProcessing = models.reduce((acc, model) => ({
      ...acc,
      [model]: true
    }), {});
    setProcessingLLMs(initialProcessing);

    // Initialize progress messages
    const initialProgress = models.reduce((acc, model) => ({
      ...acc,
      [model]: 'Starting analysis...'
    }), {});
    setLlmProgress(initialProgress);
    
    // Process each model in parallel
    await Promise.all(models.map(async (model) => {
      const startTime = Date.now();
      
      // Simulate different stages of processing
      const stages = [
        'Reading code...',
        'Analyzing bug...',
        'Generating fix...',
        'Validating solution...'
      ];
      
      for (const stage of stages) {
        setLlmProgress(prev => ({
          ...prev,
          [model]: stage
        }));
        // Simulate varying processing times for each stage
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));
      }
      
      const endTime = Date.now();
      // Generate a solution based on the bug's correct answer
      const possibleSolutions = [
        bug.correctAnswer, // Correct solution
        bug.code, // Original buggy code
        bug.correctAnswer.replace('+', '-'), // Wrong operator
        bug.correctAnswer.replace('return', 'console.log'), // Wrong output
      ];

      // Higher chance of correct solution for more advanced models
      const correctnessChance = {
        'gpt-4': 0.9,
        'claude-3': 0.85,
        'cohere': 0.7
      }[model] || 0.5;

      const isCorrect = Math.random() < correctnessChance;
      const solution = isCorrect ? bug.correctAnswer : possibleSolutions[Math.floor(Math.random() * possibleSolutions.length)];

      llmChallenges[model] = {
        startTime,
        endTime,
        solution,
        isCorrect,
      };
      
      // Mark this model as done
      setProcessingLLMs(prev => ({
        ...prev,
        [model]: false
      }));
      setLlmProgress(prev => ({
        ...prev,
        [model]: 'Complete!'
      }));
      
      // Update results as they complete
      setLlmResults(prev => ({
        ...prev,
        [model]: llmChallenges[model]
      }));
    }));
  };

  const validateSolution = (solution: string): string => {
    if (!solution.trim()) {
      return 'Solution cannot be empty';
    }
    
    try {
      // Basic syntax check
      Function(solution);
    } catch (error) {
      return `Syntax Error: ${(error as Error).message}`;
    }

    return '';
  };

  const submitSolution = () => {
    if (!currentBug || !challenge) return;

    const error = validateSolution(currentSolution);
    if (error) {
      setSolutionError(error);
      return;
    }

    const endTime = Date.now();
    const updatedChallenge = {
      ...challenge,
      endTime,
      solution: currentSolution,
      isCorrect: currentSolution.replace(/\s+/g, '') === currentBug.correctAnswer.replace(/\s+/g, ''),
    };
    setChallenge(updatedChallenge);

    // Calculate comparison result
    const comparisonResult: ComparisonResult = {
      bugId: currentBug.id,
      humanTime: endTime - challenge.startTime,
      llmTimes: {},
      isHumanCorrect: updatedChallenge.isCorrect || false,
      llmCorrectness: {},
    };

    for (const [model, result] of Object.entries(llmResults)) {
      const challenge = result as Challenge;
      if (challenge.endTime) {
        comparisonResult.llmTimes[model] = challenge.endTime - challenge.startTime;
        comparisonResult.llmCorrectness[model] = challenge.isCorrect || false;
      }
    }

    setSolutionError('');
    setComparisonResult(comparisonResult);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!currentBug ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Debug Challenge</h2>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => startChallenge({
              id: '1',
              code: '// Sample bug\nfunction add(a, b) {\n  return a - b;\n}',
              language: 'javascript',
              description: 'Fix the addition function',
              correctAnswer: 'function add(a, b) {\n  return a + b;\n}',
            })}
          >
            Start New Challenge
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Bug Description</h3>
            <p className="text-lg mb-4 text-gray-700">{currentBug.description}</p>
            <pre className="bg-gray-900 text-white p-6 rounded-lg mt-2 text-lg">
              {currentBug.code}
            </pre>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">LLM Progress</h3>
              <div className="space-y-2">
                {Object.entries(processingLLMs).map(([model, isProcessing]) => (
                  <div key={model} className="flex items-center justify-between p-2 rounded bg-white">
                    <span className="font-medium text-gray-700">{model}</span>
                    <div className="flex items-center">
                      {isProcessing ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-blue-600">{llmProgress[model]}</span>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">Complete ✓</span>
                          {llmResults[model] && (
                            <span className="text-gray-500 text-sm">
                              ({(llmResults[model].endTime! - llmResults[model].startTime).toLocaleString()}ms)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <textarea
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg text-lg"
              placeholder="Enter your solution"
              value={currentSolution}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentSolution(e.target.value)}
            />
            {solutionError && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {solutionError}
              </div>
            )}
            <button
              onClick={submitSolution}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Submit Solution
            </button>
          </div>

          {comparisonResult && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Results</h3>
              <div className="space-y-4 text-lg">
                <div className={`p-4 rounded-lg ${challenge?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {challenge?.isCorrect ? 'Your solution is correct! 🎉' : 'Your solution is incorrect. Try again! 💪'}
                </div>
                <p className="text-gray-700">Your time: <span className="font-semibold">{comparisonResult.humanTime}ms</span></p>
                {Object.entries(comparisonResult.llmTimes).map(([model, time]) => (
                  <p key={model} className="text-gray-700">
                    {model}: <span className="font-semibold">{time}ms</span>
                  </p>
                ))}
                
                {!challenge?.isCorrect && currentBug && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-xl font-semibold mb-3 text-gray-800">Correct Solution:</h4>
                    <pre className="bg-gray-900 text-white p-6 rounded-lg text-lg font-mono">
                      {currentBug.correctAnswer}
                    </pre>
                    <p className="mt-3 text-sm text-gray-600">
                      Take a moment to understand the solution and try another challenge!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}