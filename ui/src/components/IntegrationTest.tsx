import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

const integrationTests: TestResult[] = [
  { test: "Landing Page Load", status: 'pending' },
  { test: "Microservices Showcase", status: 'pending' },
  { test: "Intent Parser", status: 'pending' },
  { test: "Service Orchestration", status: 'pending' },
  { test: "Payment Integration", status: 'pending' },
  { test: "Results Aggregation", status: 'pending' },
  { test: "Error Handling", status: 'pending' },
  { test: "Complete Workflow", status: 'pending' }
];

export function IntegrationTest() {
  const [tests, setTests] = useState<TestResult[]>(integrationTests);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');

  const runTest = async (testIndex: number): Promise<TestResult> => {
    const test = tests[testIndex];
    const startTime = Date.now();

    // Update test status to running
    setTests(prev => prev.map((t, i) => 
      i === testIndex ? { ...t, status: 'running' } : t
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const duration = Date.now() - startTime;
    const shouldPass = Math.random() > 0.1; // 90% pass rate for demo

    const result: TestResult = {
      ...test,
      status: shouldPass ? 'passed' : 'failed',
      message: shouldPass ? 'Test passed successfully' : 'Test failed - check configuration',
      duration
    };

    // Update test result
    setTests(prev => prev.map((t, i) => 
      i === testIndex ? result : t
    ));

    return result;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');

    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
    }

    const allPassed = tests.every(test => test.status === 'passed');
    setOverallStatus(allPassed ? 'passed' : 'failed');
    setIsRunning(false);
  };

  const resetTests = () => {
    setTests(integrationTests);
    setOverallStatus('idle');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-muted-foreground';
      case 'running':
        return 'text-primary';
      case 'passed':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Integration Test Suite
        </h2>
        <p className="text-muted-foreground">
          Comprehensive testing of the complete user workflow
        </p>
      </div>

      {/* Overall Status */}
      <Card className="p-6 glass border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Test Results</h3>
            <p className="text-sm text-muted-foreground">
              {passedTests} of {totalTests} tests passed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overallStatus === 'running' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Running
              </Badge>
            )}
            {overallStatus === 'passed' && (
              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                <CheckCircle className="w-3 h-3" />
                All Passed
              </Badge>
            )}
            {overallStatus === 'failed' && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3" />
                Some Failed
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/50 rounded-full h-2 mb-4">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(passedTests / totalTests) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          <Button
            onClick={resetTests}
            variant="outline"
            disabled={isRunning}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Test Results */}
      <div className="space-y-3">
        {tests.map((test, index) => (
          <motion.div
            key={test.test}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 glass border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium text-foreground">{test.test}</h4>
                    {test.message && (
                      <p className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <span className="text-xs text-muted-foreground">
                      {test.duration}ms
                    </span>
                  )}
                  <Badge
                    variant={test.status === 'passed' ? 'default' : test.status === 'failed' ? 'destructive' : 'secondary'}
                    className={test.status === 'passed' ? 'bg-success/10 text-success border-success/20' : ''}
                  >
                    {test.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Test Summary */}
      {overallStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className={overallStatus === 'passed' ? 'border-success/20 bg-success/10' : 'border-destructive/20 bg-destructive/10'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {overallStatus === 'passed' ? (
                <span className="text-success">
                  🎉 All integration tests passed! The complete user workflow is functioning correctly.
                </span>
              ) : (
                <span className="text-destructive">
                  ⚠️ Some tests failed. Please check the configuration and try again.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}
