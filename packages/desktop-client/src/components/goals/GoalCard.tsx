import React, { useState } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { Text } from '@actual-app/components/text';
import { Button } from '@actual-app/components/button';

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

interface GoalCardProps {
  goal: Goal;
  onDelete: () => void;
  onClick?: () => void;
}

export function GoalCard({ goal, onDelete, onClick }: GoalCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const isCompleted = progress >= 100;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  
  // Calculate days until target date
  const daysUntilTarget = goal.target_date 
    ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View
      style={{
        backgroundColor: theme.tableBackground,
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${theme.tableBorder}`,
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: goal.color,
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.pageTextDark,
              }}
            >
              {goal.name}
            </Text>
            {isCompleted && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: theme.noticeTextLight,
                  backgroundColor: theme.noticeBackgroundLight,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  marginLeft: 10,
                }}
              >
                ✓ Complete
              </Text>
            )}
          </View>
          
          {goal.description && (
            <Text
              style={{
                fontSize: 14,
                color: theme.pageTextSubdued,
                marginBottom: 5,
              }}
            >
              {goal.description}
            </Text>
          )}
          
          <Text
            style={{
              fontSize: 12,
              color: theme.pageTextSubdued,
              fontFamily: 'monospace',
            }}
          >
            Tag: #{goal.tag_pattern}
          </Text>
        </View>

        {/* Actions */}
        {showActions && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              opacity: showActions ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Button
              variant="bare"
              onPress={onDelete}
              style={{
                padding: 6,
                borderRadius: 4,
                backgroundColor: theme.errorBackground,
              }}
            >
              <Text style={{ color: theme.errorText, fontSize: 12 }}>×</Text>
            </Button>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={{ marginBottom: 15 }}>
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
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: isCompleted ? theme.noticeBackgroundLight : goal.color,
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: theme.pageTextSubdued, fontSize: 12 }}>
            {formatCurrency(goal.current_amount)}
          </Text>
          <Text style={{ color: theme.pageTextSubdued, fontSize: 12 }}>
            {progress.toFixed(1)}%
          </Text>
          <Text style={{ color: theme.pageTextSubdued, fontSize: 12 }}>
            {formatCurrency(goal.target_amount)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 15,
          borderTop: `1px solid ${theme.tableBorder}`,
          gap: 20,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 12,
              color: theme.pageTextSubdued,
              marginBottom: 2,
            }}
          >
            Achieved
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
            }}
          >
            {formatCurrency(goal.current_amount)}
          </Text>
        </View>

        <View>
          <Text
            style={{
              fontSize: 12,
              color: theme.pageTextSubdued,
              marginBottom: 2,
            }}
          >
            Remaining
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isCompleted ? theme.noticeTextLight : theme.pageTextDark,
            }}
          >
            {isCompleted ? 'Goal Reached!' : formatCurrency(remaining)}
          </Text>
        </View>

        {goal.target_date && (
          <View style={{ textAlign: 'right' }}>
            <Text
              style={{
                fontSize: 12,
                color: theme.pageTextSubdued,
                marginBottom: 2,
              }}
            >
              Target Date
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: daysUntilTarget && daysUntilTarget < 30 
                  ? theme.warningText 
                  : theme.pageTextDark,
              }}
            >
              {formatDate(goal.target_date)}
            </Text>
            {daysUntilTarget !== null && (
              <Text
                style={{
                  fontSize: 11,
                  color: daysUntilTarget < 30 ? theme.warningText : theme.pageTextSubdued,
                }}
              >
                {daysUntilTarget > 0 
                  ? `${daysUntilTarget} days left`
                  : daysUntilTarget === 0 
                    ? 'Due today'
                    : `${Math.abs(daysUntilTarget)} days overdue`
                }
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
