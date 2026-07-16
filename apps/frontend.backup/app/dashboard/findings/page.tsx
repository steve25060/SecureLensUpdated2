'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { findingsService, aiService } from '@/services/scan.service';
import { AlertCircle, Loader2, MessageCircle, Zap } from 'lucide-react';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  source: string;
  targetUrl: string;
  evidence?: string;
  remediation?: string;
  cve?: string;
  cwe?: string;
  aiExplanation?: string;
}

const severityColors = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  info: 'bg-gray-100 text-gray-800',
};

const severityBorderColors = {
  critical: 'border-l-4 border-red-500',
  high: 'border-l-4 border-orange-500',
  medium: 'border-l-4 border-yellow-500',
  low: 'border-l-4 border-blue-500',
  info: 'border-l-4 border-gray-500',
};

function FindingsContent() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scanId');

  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (scanId) {
      loadFindings();
    }
  }, [scanId]);

  const loadFindings = async () => {
    try {
      setIsLoading(true);
      const data = await findingsService.getFindingsByScan(scanId!);
      setFindings(data);
    } catch (err) {
      setError('Failed to load findings: ' + (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainFinding = async (findingId: string) => {
    try {
      setAiLoading({ ...aiLoading, [findingId]: true });
      const response = await aiService.explainFinding(findingId);
      setAiResponses({
        ...aiResponses,
        [findingId]: response.explanation || response.error || 'Unable to generate explanation',
      });
    } catch (err) {
      setAiResponses({
        ...aiResponses,
        [findingId]: 'Error: ' + (err as any).message,
      });
    } finally {
      setAiLoading({ ...aiLoading, [findingId]: false });
    }
  };

  if (!scanId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No scan ID provided. Please start a scan first.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading findings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">No findings detected. Great security posture!</p>
        </CardContent>
      </Card>
    );
  }

  // Group findings by severity
  const groupedFindings = {
    critical: findings.filter((f) => f.severity === 'critical'),
    high: findings.filter((f) => f.severity === 'high'),
    medium: findings.filter((f) => f.severity === 'medium'),
    low: findings.filter((f) => f.severity === 'low'),
    info: findings.filter((f) => f.severity === 'info'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Findings</h1>
        <p className="text-gray-600 mt-2">
          Scan ID: {scanId}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(groupedFindings).map(([severity, items]) => (
          <Card key={severity}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${severityColors[severity]}`}>
                  {items.length}
                </div>
                <p className="text-xs text-gray-600 mt-2 capitalize">{severity}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {Object.entries(groupedFindings).map(([severity, items]) =>
          items.length > 0 ? (
            <div key={severity}>
              <h2 className="text-lg font-semibold mb-3 capitalize">{severity} Severity</h2>
              <div className="space-y-3">
                {items.map((finding) => (
                  <Card
                    key={finding.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      severityBorderColors[finding.severity]
                    }`}
                  >
                    <CardContent
                      className="pt-6"
                      onClick={() =>
                        setExpandedFinding(
                          expandedFinding === finding.id ? null : finding.id,
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={severityColors[finding.severity]}
                              variant="secondary"
                            >
                              {finding.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{finding.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-2">{finding.title}</h3>
                          <p className="text-sm text-gray-600">{finding.description}</p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedFinding === finding.id && (
                        <div className="mt-4 space-y-4 border-t pt-4">
                          {finding.evidence && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Evidence</h4>
                              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {finding.evidence}
                              </pre>
                            </div>
                          )}

                          {finding.remediation && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Remediation</h4>
                              <p className="text-sm text-gray-700">{finding.remediation}</p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExplainFinding(finding.id);
                              }}
                              disabled={aiLoading[finding.id]}
                            >
                              {aiLoading[finding.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="mr-2 h-3 w-3" />
                                  AI Explanation
                                </>
                              )}
                            </Button>
                          </div>

                          {aiResponses[finding.id] && (
                            <div className="bg-blue-50 p-3 rounded text-sm">
                              <p className="text-blue-900">{aiResponses[finding.id]}</p>
                            </div>
                          )}

                          {finding.cve && (
                            <div>
                              <span className="text-xs font-semibold">CVE:</span>
                              <span className="text-xs ml-2 font-mono">{finding.cve}</span>
                            </div>
                          )}

                          {finding.cwe && (
                            <div>
                              <span className="text-xs font-semibold">CWE:</span>
                              <span className="text-xs ml-2 font-mono">{finding.cwe}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FindingsContent />
    </Suspense>
  );
}
