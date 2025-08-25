import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';

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

interface Transaction {
  id: string;
  date: string;
  amount: number;
  notes: string;
  payee: string;
  account: string;
}

export function GoalDetailsPage() {
  const { t } = useTranslation();
  const { goalId } = useParams();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoalDetails();
  }, [goalId]);

  const loadGoalDetails = async () => {
    if (!goalId) return;
    
    try {
      setIsLoading(true);
      
      // Load goal details
      const goals = await send('goals-get');
      const currentGoal = goals.find((g: Goal) => g.id === goalId);
      setGoal(currentGoal || null);
      
      if (currentGoal) {
        // Load transactions with matching tags using a direct database query
        // Since we don't have a specific transactions API, let's create one in our goals backend
        const goalTransactions = await send('goals-get-transactions', {
          goalId: currentGoal.id,
          tagPattern: currentGoal.tag_pattern
        });
        
        setTransactions(goalTransactions || []);
      }
    } catch (error) {
      console.error('Failed to load goal details:', error);
      // Fallback: set empty transactions if API call fails
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${(Math.abs(amount) / 100).toLocaleString()}`;
  };

  const formatDate = (dateValue: any) => {
    // Handle different date formats that might come from the database
    let date;
    
    if (!dateValue) {
      return 'No Date';
    }
    
    // Convert to string first if it's not already
    const dateString = String(dateValue);
    
    // Actual Budget typically uses YYYYMMDD format (like 20250125)
    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
      // Parse YYYYMMDD format
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dateString.substring(6, 8));
      date = new Date(year, month, day);
    } else if (dateString.includes('-')) {
      // Try parsing as YYYY-MM-DD format
      date = new Date(dateString + 'T00:00:00');
    } else {
      // Try parsing as timestamp
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        date = new Date(timestamp);
      } else {
        date = new Date(dateString);
      }
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return `Invalid: ${dateString}`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        <Text style={{ color: theme.pageTextSubdued }}>Loading goal details...</Text>
      </View>
    );
  }

  if (!goal) {
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
        <Text style={{ color: theme.pageTextSubdued, marginBottom: 20 }}>
          Goal not found
        </Text>
        <Button variant="primary" onPress={() => navigate('/goals')}>
          <Text style={{ color: theme.buttonPrimaryText }}>Back to Goals</Text>
        </Button>
      </View>
    );
  }

  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

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
        <View style={{ flex: 1 }}>
          <Button
            variant="bare"
            onPress={() => navigate('/goals')}
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 0,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: theme.pageTextSubdued, fontSize: 14 }}>
              ← Back to Goals
            </Text>
          </Button>
          
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
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.pageTextDark,
              }}
            >
              {goal.name}
            </Text>
          </View>
          
          {goal.description && (
            <Text
              style={{
                fontSize: 16,
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
      </View>

      {/* Progress Summary */}
      <View
        style={{
          backgroundColor: theme.tableBackground,
          borderRadius: 8,
          padding: 20,
          marginBottom: 30,
          border: `1px solid ${theme.tableBorder}`,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.pageTextSubdued }}>Achieved</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.pageTextDark }}>
              {formatCurrency(goal.current_amount)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: theme.pageTextSubdued }}>Remaining</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.pageTextDark }}>
              {formatCurrency(remaining)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: theme.pageTextSubdued }}>Target</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.pageTextDark }}>
              {formatCurrency(goal.target_amount)}
            </Text>
          </View>
        </View>
        
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
              backgroundColor: goal.color,
              borderRadius: 4,
            }}
          />
        </View>
        
        <Text
          style={{
            fontSize: 14,
            color: theme.pageTextSubdued,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          {progress.toFixed(1)}% Complete
        </Text>
      </View>

      {/* Transactions */}
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.pageTextDark,
            marginBottom: 15,
          }}
        >
          Contributing Transactions ({transactions.length})
        </Text>

        {transactions.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.tableBackground,
              borderRadius: 8,
              padding: 40,
              border: `1px solid ${theme.tableBorder}`,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.pageTextSubdued, textAlign: 'center' }}>
              No transactions found with tag #{goal.tag_pattern}
            </Text>
            <Text style={{ color: theme.pageTextSubdued, textAlign: 'center', marginTop: 10, fontSize: 12 }}>
              Add transactions with "#{goal.tag_pattern}" in the notes to track progress
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.tableBackground,
              borderRadius: 8,
              border: `1px solid ${theme.tableBorder}`,
              overflow: 'hidden',
            }}
          >
            {transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                style={{
                  padding: 15,
                  borderBottom: index < transactions.length - 1 ? `1px solid ${theme.tableBorder}` : 'none',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.pageTextDark,
                      marginBottom: 2,
                    }}
                  >
                    {transaction.notes
                      ? transaction.notes
                          .replace(`#${goal.tag_pattern}`, '')
                          .replace(/\s+/g, ' ')
                          .trim()
                      : 'Transaction'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.pageTextSubdued,
                    }}
                  >
                    {formatDate(transaction.date)} • {transaction.account}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: transaction.amount > 0 ? theme.noticeTextLight : theme.errorText,
                  }}
                >
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
