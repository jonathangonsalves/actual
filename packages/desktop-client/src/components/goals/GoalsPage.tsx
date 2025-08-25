import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { Stack } from '@actual-app/components/stack';

import { GoalCard } from './GoalCard';
import { CreateGoalModal } from './CreateGoalModal';

import { send } from 'loot-core/platform/client/fetch';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  tag_pattern: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function GoalsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals from backend
  const loadGoals = async () => {
    try {
      setIsLoading(true);
      // First recalculate progress to ensure it's up to date
      await send('goals-recalculate');
      // Then load the updated goals
      const goalsData = await send('goals-get');
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (goalData: any) => {
    try {
      await send('goals-create', { goal: goalData });
      await loadGoals(); // Reload goals to get updated data
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      // TODO: Show error message to user
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await send('goals-delete', { id: goalId });
      await loadGoals(); // Reload goals to get updated data
    } catch (error) {
      console.error('Failed to delete goal:', error);
      // TODO: Show error message to user
    }
  };

  const handleGoalClick = (goal: Goal) => {
    // Navigate to goal details page
    navigate(`/goals/${goal.id}`);
  };

  const handleRefreshProgress = async () => {
    try {
      await send('goals-recalculate');
      await loadGoals(); // Reload goals to get updated progress
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.pageBackground,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: theme.pageTextSubdued }}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.pageBackground,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 30,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: theme.pageTextDark,
              marginBottom: 5,
            }}
          >
            Financial Goals
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.pageTextSubdued,
            }}
          >
            Track your savings progress with transaction tags
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Button
            variant="bare"
            onPress={handleRefreshProgress}
            style={{
              backgroundColor: theme.pageBackgroundModalNormal,
              paddingHorizontal: 8,
              paddingVertical: 8,
              borderRadius: 6,
              minWidth: 'auto',
            }}
          >
            <Text style={{ color: theme.pageTextSubdued, fontSize: 16 }}>
              🔄
            </Text>
          </Button>
          
          <Button
            variant="primary"
            onPress={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: theme.buttonPrimaryBackground,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: theme.buttonPrimaryText, fontWeight: '600' }}>
              + New Goal
            </Text>
          </Button>
        </View>
      </View>

      {/* Overall Progress Summary */}
      {goals.length > 0 && (
        <View
          style={{
            backgroundColor: theme.tableBackground,
            borderRadius: 8,
            padding: 20,
            marginBottom: 30,
            border: `1px solid ${theme.tableBorder}`,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 15,
            }}
          >
            Overall Progress
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.pageBackgroundModalNormal,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(overallProgress, 100)}%`,
                    backgroundColor: theme.noticeBackgroundLight,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
            
            <Text style={{ color: theme.pageTextSubdued, fontSize: 14, minWidth: 60 }}>
              {overallProgress.toFixed(1)}%
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ color: theme.pageTextSubdued, fontSize: 12 }}>
              ${(totalCurrentAmount / 100).toLocaleString()}
            </Text>
            <Text style={{ color: theme.pageTextSubdued, fontSize: 12 }}>
              ${(totalTargetAmount / 100).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: theme.pageTextSubdued,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            No financial goals yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.pageTextSubdued,
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 1.5,
            }}
          >
            Create your first goal to start tracking your savings progress.{'\n'}
            Use transaction tags to automatically track contributions.
          </Text>
          <Button
            variant="primary"
            onPress={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: theme.buttonPrimaryBackground,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: theme.buttonPrimaryText, fontWeight: '600' }}>
              Create Your First Goal
            </Text>
          </Button>
        </View>
      ) : (
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 20,
          }}
        >
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => handleDeleteGoal(goal.id)}
              onClick={() => handleGoalClick(goal)}
            />
          ))}
        </View>
      )}

      {/* Create Goal Modal */}
      {isCreateModalOpen && (
        <CreateGoalModal
          onSave={handleCreateGoal}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </View>
  );
}
