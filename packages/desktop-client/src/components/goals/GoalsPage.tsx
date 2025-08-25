import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { Stack } from '@actual-app/components/stack';

import { GoalCard } from './GoalCard';
import { CreateGoalModal } from './CreateGoalModal';

// Mock data for development
const mockGoals = [
  {
    id: '1',
    name: 'New Car',
    description: 'Save for a reliable family car',
    target_amount: 2500000, // $25,000 in cents
    current_amount: 750000, // $7,500 in cents
    target_date: '2025-12-31',
    tag_pattern: 'goal_car',
    color: '#3b82f6',
    created_at: '2024-01-01',
    updated_at: '2024-08-25',
  },
  {
    id: '2',
    name: 'Emergency Fund',
    description: '6 months of expenses',
    target_amount: 1800000, // $18,000 in cents
    current_amount: 1200000, // $12,000 in cents
    target_date: '2025-06-30',
    tag_pattern: 'goal_emergency',
    color: '#10b981',
    created_at: '2024-01-01',
    updated_at: '2024-08-25',
  },
  {
    id: '3',
    name: 'Vacation Fund',
    description: 'Trip to Europe next summer',
    target_amount: 500000, // $5,000 in cents
    current_amount: 150000, // $1,500 in cents
    target_date: '2025-07-01',
    tag_pattern: 'goal_vacation',
    color: '#f59e0b',
    created_at: '2024-02-01',
    updated_at: '2024-08-25',
  },
];

export function GoalsPage() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState(mockGoals);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateGoal = (goalData: any) => {
    // TODO: Connect to backend API
    const newGoal = {
      id: Date.now().toString(),
      ...goalData,
      current_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGoals([...goals, newGoal]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    // TODO: Connect to backend API
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

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
