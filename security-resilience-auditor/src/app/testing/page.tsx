"use client";

import { WorkflowTestRunner } from "@/components/testing/workflow-test-runner";

export default function TestingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            End-to-End Testing
          </h1>
          <p className="text-muted-foreground">
            Comprehensive workflow validation and responsive design testing
          </p>
        </div>
      </div>

      <WorkflowTestRunner />
    </div>
  );
}
