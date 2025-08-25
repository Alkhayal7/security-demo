"use client";

import { useState, useEffect } from "react";
import { SecurityMap } from "@/components/map/security-map";
import { SiteDetailsPanel } from "@/components/map/site-details-panel";
import { TestSelectionPanel } from "@/components/map/test-selection-panel";
import { TestExecutionPanel } from "@/components/map/test-execution-panel";
import { useSecurityContext } from "@/contexts/security-context";
import { SecurityDataManager } from "../../lib/security-data";
import { SecurityTest, TestResult } from "@/types/security-types";

export default function MapPage() {
  const { state, actions } = useSecurityContext();
  const [selectedTest, setSelectedTest] = useState<SecurityTest | null>(null);
  const [showTestSelectionPanel, setShowTestSelectionPanel] = useState(false);
  const [showTestExecutionPanel, setShowTestExecutionPanel] = useState(false);
  const [availableTests, setAvailableTests] = useState<SecurityTest[]>([]);

  // Get the selected site
  const selectedSite = state.selectedSiteId
    ? state.sites.find((s) => s.id === state.selectedSiteId) || null
    : null;

  // Close panels when no site is selected
  useEffect(() => {
    if (!state.selectedSiteId) {
      setShowTestSelectionPanel(false);
      setShowTestExecutionPanel(false);
      setSelectedTest(null);
    }
  }, [state.selectedSiteId]);

  const handleRunTests = (_siteId: string) => {
    // Get available tests for the site and show test selection panel
    const tests = SecurityDataManager.getAvailableTests();
    setAvailableTests(tests);
    setShowTestSelectionPanel(true);
    setShowTestExecutionPanel(false);
  };

  const handleTestSelected = (testId: string) => {
    // Find the selected test and start execution
    const testToRun = availableTests.find((test) => test.id === testId);
    if (testToRun) {
      setSelectedTest(testToRun);
      setShowTestSelectionPanel(false);
      setShowTestExecutionPanel(true);
    }
  };

  const handleTestComplete = (result: TestResult) => {
    // Update test results in the context
    actions.updateTestResults(result.siteId, [result]);

    // Keep the test panel open to show results
    // User can manually close it
  };

  const handleCloseSitePanel = () => {
    actions.selectSite(null);
  };

  const handleCloseTestSelectionPanel = () => {
    setShowTestSelectionPanel(false);
  };

  const handleCloseTestExecutionPanel = () => {
    setShowTestExecutionPanel(false);
    setSelectedTest(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] overflow-hidden">
      {/* Main Map - adjust width based on open panels */}
      <div
        className={`transition-all duration-300 ease-in-out h-full ${
          state.selectedSiteId &&
          !showTestSelectionPanel &&
          !showTestExecutionPanel
            ? "mr-96"
            : showTestSelectionPanel || showTestExecutionPanel
            ? "mr-[480px]"
            : ""
        }`}
      >
        <SecurityMap className="w-full h-full" />
      </div>

      {/* Site Details Panel */}
      <SiteDetailsPanel
        site={selectedSite}
        isOpen={
          !!state.selectedSiteId &&
          !showTestSelectionPanel &&
          !showTestExecutionPanel
        }
        onClose={handleCloseSitePanel}
        onRunTests={handleRunTests}
      />

      {/* Test Selection Panel */}
      <TestSelectionPanel
        site={selectedSite}
        tests={availableTests}
        isOpen={showTestSelectionPanel}
        onClose={handleCloseTestSelectionPanel}
        onRunTest={handleTestSelected}
      />

      {/* Test Execution Panel */}
      <TestExecutionPanel
        site={selectedSite}
        test={selectedTest}
        isOpen={showTestExecutionPanel}
        onClose={handleCloseTestExecutionPanel}
        onTestComplete={handleTestComplete}
      />
    </div>
  );
}
