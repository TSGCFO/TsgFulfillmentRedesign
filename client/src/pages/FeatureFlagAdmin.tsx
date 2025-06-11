/**
 * Feature Flag Administration Panel
 * 
 * Allows SuperAdmins to manage feature flags from the UI
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, Users, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function FeatureFlagAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if user has access
  if (!user || user.role !== "SuperAdmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              SuperAdmin access required to manage feature flags.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/admin/feature-flags");
      const data = await response.json();
      setFlags(data.data || []);
    } catch (error) {
      toast({
        title: "Error loading feature flags",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagName: string, enabled: boolean) => {
    try {
      setUpdating(flagName);
      const endpoint = enabled ? 
        `/api/admin/feature-flags/${flagName}/enable` : 
        `/api/admin/feature-flags/${flagName}/disable`;
      
      await apiRequest("POST", endpoint);
      
      toast({
        title: `Feature flag ${enabled ? 'enabled' : 'disabled'}`,
        description: `${flagName} has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
      });
      
      await loadFlags();
    } catch (error) {
      toast({
        title: "Error updating feature flag",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const updateRollout = async (flagName: string, rolloutPercentage: number, roles: string[], users: string[]) => {
    try {
      setUpdating(flagName);
      await apiRequest("POST", `/api/admin/feature-flags/${flagName}/enable`, {
        rolloutPercentage,
        roles: roles.filter(r => r.trim()),
        users: users.filter(u => u.trim()),
      });
      
      toast({
        title: "Rollout settings updated",
        description: `${flagName} rollout configuration has been updated.`,
      });
      
      await loadFlags();
    } catch (error) {
      toast({
        title: "Error updating rollout",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getFlagIcon = (flagName: string) => {
    if (flagName.includes('user') || flagName.includes('management')) return Users;
    if (flagName.includes('auth')) return Shield;
    return Settings;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Feature Flag Administration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage feature flags for gradual rollouts and testing
        </p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Important:</strong> Changes to feature flags take effect immediately. 
          Use caution when enabling/disabling flags in production.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {flags.map((flag) => {
          const Icon = getFlagIcon(flag.name);
          
          return (
            <FeatureFlagCard
              key={flag.name}
              flag={flag}
              icon={Icon}
              updating={updating === flag.name}
              onToggle={(enabled) => toggleFlag(flag.name, enabled)}
              onUpdateRollout={(rollout, roles, users) => 
                updateRollout(flag.name, rollout, roles, users)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

interface FeatureFlagCardProps {
  flag: FeatureFlag;
  icon: any;
  updating: boolean;
  onToggle: (enabled: boolean) => void;
  onUpdateRollout: (rollout: number, roles: string[], users: string[]) => void;
}

function FeatureFlagCard({ flag, icon: Icon, updating, onToggle, onUpdateRollout }: FeatureFlagCardProps) {
  const [rolloutPercentage, setRolloutPercentage] = useState(flag.rolloutPercentage || 0);
  const [roles, setRoles] = useState<string>((flag.enabledForRoles || []).join(', '));
  const [users, setUsers] = useState<string>((flag.enabledForUsers || []).join(', '));
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg">{flag.name}</CardTitle>
              <CardDescription>{flag.description || 'No description available'}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={flag.enabled ? "default" : "secondary"}>
              {flag.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <Switch
              checked={flag.enabled}
              onCheckedChange={onToggle}
              disabled={updating}
            />
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
          </div>
        </div>
      </CardHeader>
      
      {flag.enabled && (
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>

            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor={`rollout-${flag.name}`}>
                    Rollout Percentage (0-100%)
                  </Label>
                  <Input
                    id={`rollout-${flag.name}`}
                    type="number"
                    min="0"
                    max="100"
                    value={rolloutPercentage}
                    onChange={(e) => setRolloutPercentage(Number(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Percentage of authenticated users who will see this feature
                  </p>
                </div>

                <div>
                  <Label htmlFor={`roles-${flag.name}`}>
                    Enabled for Roles (comma-separated)
                  </Label>
                  <Input
                    id={`roles-${flag.name}`}
                    value={roles}
                    onChange={(e) => setRoles(e.target.value)}
                    placeholder="SuperAdmin, Admin, User"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Always enable for these roles, regardless of rollout percentage
                  </p>
                </div>

                <div>
                  <Label htmlFor={`users-${flag.name}`}>
                    Enabled for Users (comma-separated usernames)
                  </Label>
                  <Input
                    id={`users-${flag.name}`}
                    value={users}
                    onChange={(e) => setUsers(e.target.value)}
                    placeholder="john.doe, jane.smith"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Always enable for these specific users
                  </p>
                </div>

                <Button
                  onClick={() => onUpdateRollout(
                    rolloutPercentage,
                    roles.split(',').map(r => r.trim()).filter(r => r),
                    users.split(',').map(u => u.trim()).filter(u => u)
                  )}
                  disabled={updating}
                  className="w-full"
                >
                  Update Rollout Settings
                </Button>
              </div>
            )}

            {(flag.rolloutPercentage && flag.rolloutPercentage > 0) && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Current Rollout:</strong> {flag.rolloutPercentage}% of users
                </p>
              </div>
            )}

            {(flag.enabledForRoles && flag.enabledForRoles.length > 0) && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Always enabled for roles:</strong> {flag.enabledForRoles.join(', ')}
                </p>
              </div>
            )}

            {(flag.enabledForUsers && flag.enabledForUsers.length > 0) && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Always enabled for users:</strong> {flag.enabledForUsers.join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}