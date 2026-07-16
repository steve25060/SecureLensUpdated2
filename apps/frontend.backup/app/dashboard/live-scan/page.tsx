'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { scanService, findingsService, AvailableEngine } from '@/services/scan.service';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Check } from 'lucide-react';

export default function LiveScanPage() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [engines, setEngines] = useState<AvailableEngine[]>([]);
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [scanId, setScanId] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load available engines on mount
  useEffect(() => {
    loadEngines();
  }, []);

  // Poll scan status
  useEffect(() => {
    if (!scanId || !isExecuting) return;

    const interval = setInterval(async () => {
      try {
        const status = await scanService.getScanStatus(scanId);
        setScanStatus(status.status);
        setScanProgress(status.progress);

        if (status.status === 'completed' || status.status === 'failed') {
          setIsExecuting(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanId, isExecuting]);

  const loadEngines = async () => {
    try {
      setIsLoading(true);
      const available = await scanService.getEnginesForMode('website');
      setEngines(available);
      // Auto-select first few engines
      const defaults = new Set(available.slice(0, 3).map((e) => e.id));
      setSelectedEngines(defaults);
    } catch (err) {
      setError('Failed to load available engines');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEngine = (engineId: string) => {
    const newSelected = new Set(selectedEngines);
    if (newSelected.has(engineId)) {
      newSelected.delete(engineId);
    } else {
      newSelected.add(engineId);
    }
    setSelectedEngines(newSelected);
  };

  const validateForm = () => {
    if (!workspaceId.trim()) {
      setError('Please select or create a workspace');
      return false;
    }
    if (!targetUrl.trim()) {
      setError('Please enter a target URL');
      return false;
    }
    if (selectedEngines.size === 0) {
      setError('Please select at least one security engine');
      return false;
    }

    try {
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return false;
    }

    return true;
  };

  const handleCreateScan = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await scanService.createScan({
        workspaceId,
        mode: 'website',
        target: targetUrl,
        engines: Array.from(selectedEngines),
      });

      setScanId(response.scanId);
      setSuccess('Scan job created successfully. Starting scan...');

      // Auto-start the scan
      setTimeout(async () => {
        try {
          await scanService.startScan(response.scanId);
          setScanStatus('running');
          setIsExecuting(true);
        } catch (err) {
          setError('Failed to start scan: ' + (err as any).message);
        }
      }, 500);
    } catch (err) {
      setError('Failed to create scan: ' + (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = async () => {
    if (scanId) {
      router.push(`/dashboard/findings?scanId=${scanId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Website Security Scan</h1>
        <p className="text-gray-600 mt-2">
          Analyze your website for security vulnerabilities
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scan Input Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configure Scan</CardTitle>
              <CardDescription>Set up your security scan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workspace Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace ID</label>
                <Input
                  placeholder="Enter workspace ID or UUID"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  disabled={isExecuting}
                />
              </div>

              {/* Target URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target URL</label>
                <Input
                  placeholder="https://example.com"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={isExecuting}
                />
                <p className="text-xs text-gray-500">
                  Enter the website URL you want to scan
                </p>
              </div>

              {/* Engine Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Security Engines</label>
                <p className="text-xs text-gray-500">
                  Select the security scanning engines to use
                </p>
                <div className="grid gap-3">
                  {engines.map((engine) => (
                    <div
                      key={engine.id}
                      className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={engine.id}
                        checked={selectedEngines.has(engine.id)}
                        onCheckedChange={() => toggleEngine(engine.id)}
                        disabled={isExecuting}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={engine.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {engine.name}
                        </label>
                        <p className="text-xs text-gray-600">{engine.description}</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {engine.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateScan}
                  disabled={isLoading || isExecuting}
                  size="lg"
                  className="flex-1"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Start Scan'
                  )}
                </Button>
                {scanId && !isExecuting && (
                  <Button variant="outline" onClick={handleViewResults} size="lg">
                    View Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan Status Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!scanId ? (
                <p className="text-sm text-gray-600">
                  No scan in progress. Configure and start a scan to see status here.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Status</p>
                    <Badge className="w-full justify-center">
                      {scanStatus || 'queued'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold">{scanProgress}%</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-500">Scan ID</p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                      {scanId}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-500">Target</p>
                    <p className="text-xs break-all">{targetUrl}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-gray-600">
            <p>
              1. Select your security workspace or create a new one
            </p>
            <p>
              2. Enter the website URL you want to scan
            </p>
            <p>
              3. Choose which security engines to run
            </p>
            <p>
              4. Click "Start Scan" to begin analysis
            </p>
            <p>
              5. Monitor progress in real-time
            </p>
            <p>
              6. Review detailed findings and get AI-powered insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What we scan for</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-gray-600">
            <p>✓ Known vulnerabilities (CVEs)</p>
            <p>✓ Misconfigurations</p>
            <p>✓ Weak SSL/TLS</p>
            <p>✓ Missing security headers</p>
            <p>✓ Default credentials</p>
            <p>✓ Technology exposure</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
